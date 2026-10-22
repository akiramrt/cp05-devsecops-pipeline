#!/usr/bin/env python3
"""Transforma um relatório SARIF em anotações do GitHub Actions e num resumo do job.

As anotações aparecem na página da execução (aba Actions) e no diff do pull request,
apontando arquivo e linha de cada achado. O script nunca decide se o job passa ou
falha: quem barra é a própria ferramenta (gitleaks, semgrep ou trivy).

Uso:
  sarif_report.py RELATORIO.sarif --tool NOME [--only-tag TAG] [--anchor ARQUIVO:LINHA]
"""

import argparse
import json
import os
import sys

# O GitHub mostra no máximo 10 anotações de erro por passo; o resumo lista todas.
MAX_ANNOTATIONS = 10
MAX_SUMMARY_TEXT = 200


def escape_data(value):
    return value.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")


def escape_property(value):
    return escape_data(value).replace(":", "%3A").replace(",", "%2C")


def escape_cell(value):
    return value.replace("|", "\\|").replace("\r", " ").replace("\n", " ")


def rules_by_key(run):
    """Indexa as regras do SARIF por id e por posição (ruleIndex)."""
    rules = {}
    driver_rules = run.get("tool", {}).get("driver", {}).get("rules") or []
    for index, rule in enumerate(driver_rules):
        rules[rule.get("id")] = rule
        rules[index] = rule
    return rules


def normalize_uri(uri):
    """Deixa o caminho relativo à raiz do repositório (o formato que o file= espera)."""
    uri = uri.replace("\\", "/")
    if uri.startswith("file://"):
        uri = uri[len("file://"):]
    workspace = (os.environ.get("GITHUB_WORKSPACE") or "").replace("\\", "/").rstrip("/")
    if workspace and uri.startswith(workspace + "/"):
        uri = uri[len(workspace) + 1:]
    return uri


def first_location(result):
    for location in result.get("locations") or []:
        physical = location.get("physicalLocation") or {}
        uri = (physical.get("artifactLocation") or {}).get("uri")
        line = (physical.get("region") or {}).get("startLine") or 1
        if uri:
            return normalize_uri(uri), line
    return None, 1


def collect_findings(sarif, only_tag):
    findings = []
    for run in sarif.get("runs") or []:
        rules = rules_by_key(run)
        for result in run.get("results") or []:
            rule_id = result.get("ruleId") or "?"
            rule = rules.get(rule_id) or rules.get(result.get("ruleIndex")) or {}
            tags = (rule.get("properties") or {}).get("tags") or []
            if only_tag and only_tag not in tags:
                continue
            uri, line = first_location(result)
            message = ((result.get("message") or {}).get("text") or "").strip()
            findings.append({"rule": rule_id, "uri": uri, "line": line, "message": message})
    return findings


def annotate(findings, tool, anchor):
    for finding in findings[:MAX_ANNOTATIONS]:
        file_name, line = finding["uri"], finding["line"]
        if anchor:
            file_name, _, anchor_line = anchor.partition(":")
            line = int(anchor_line or 1)
        title = escape_property(f"{tool}: {finding['rule']}")
        location = f"file={escape_property(file_name)},line={line}," if file_name else ""
        print(f"::error {location}title={title}::{escape_data(finding['message'])}")


def write_summary(findings, tool, report, anchor):
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return
    lines = [f"### {tool}: {len(findings)} achado(s) em `{report}`", ""]
    if findings:
        lines += ["| Regra | Local | Mensagem |", "|---|---|---|"]
        for finding in findings:
            place = anchor or (f"{finding['uri']}:{finding['line']}" if finding["uri"] else "-")
            text = " / ".join(part.strip() for part in finding["message"].splitlines() if part.strip())
            if len(text) > MAX_SUMMARY_TEXT:
                text = text[: MAX_SUMMARY_TEXT - 3] + "..."
            lines.append(
                f"| `{escape_cell(finding['rule'])}` | `{escape_cell(place)}` | {escape_cell(text)} |"
            )
    else:
        lines.append("Nenhum achado.")
    with open(summary_path, "a", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", help="arquivo SARIF gerado pela ferramenta")
    parser.add_argument("--tool", required=True, help="nome exibido nas anotações")
    parser.add_argument("--only-tag", help="considera só regras com essa tag (ex.: CRITICAL)")
    parser.add_argument("--anchor", help="ARQUIVO:LINHA onde ancorar todas as anotações")
    args = parser.parse_args()

    if not os.path.exists(args.report):
        print(f"::warning title={escape_property(args.tool)}::Relatório {args.report} não encontrado")
        return 0

    with open(args.report, encoding="utf-8") as handle:
        sarif = json.load(handle)

    findings = collect_findings(sarif, args.only_tag)
    annotate(findings, args.tool, args.anchor)
    write_summary(findings, args.tool, args.report, args.anchor)
    print(f"{args.tool}: {len(findings)} achado(s) em {args.report}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
