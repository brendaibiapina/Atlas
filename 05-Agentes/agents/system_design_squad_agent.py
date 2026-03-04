"""
system_design_squad_agent.py

Agente especialista em design de sistemas.
Executa uma revisao local da arquitetura do front-end e gera um
relatorio consolidado como se fosse um time multidisciplinar.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime
from pathlib import Path

from loguru import logger

from agents.base_agent import BaseAgent


class SystemDesignSquadAgent(BaseAgent):
    name = "system_design_squad"
    description = "Time de especialistas em design de sistemas para revisar arquitetura, UX tecnica e consistencia"
    source_url = "workspace://04-Codigo-Fonte/src"
    target_table = "none"
    schedule = "weekly"

    def __init__(self):
        super().__init__()
        self.report_path: str | None = None

    def _workspace_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    def _app_root(self) -> Path:
        return self._workspace_root() / "04-Codigo-Fonte"

    def _collect_files(self, src_root: Path) -> list[Path]:
        files: list[Path] = []
        patterns = ("*.ts", "*.tsx", "*.js", "*.jsx", "*.css")
        for pattern in patterns:
            files.extend(src_root.rglob(pattern))
        return sorted(set(files))

    def fetch(self) -> str:
        app_root = self._app_root()
        src_root = app_root / "src"
        files = self._collect_files(src_root)

        records = []
        for file_path in files:
            try:
                text = file_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                text = file_path.read_text(errors="ignore")

            rel_path = str(file_path.relative_to(app_root))
            line_count = text.count("\n") + (1 if text else 0)
            is_client_component = "'use client'" in text[:500] or '"use client"' in text[:500]
            hash10 = hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()[:10]

            records.append(
                {
                    "path": rel_path,
                    "lines": line_count,
                    "is_client_component": is_client_component,
                    "sha1_10": hash10,
                    "content": text,
                }
            )

        has_tests = any(app_root.rglob("*.test.ts")) or any(app_root.rglob("*.test.tsx"))

        payload = {
            "collected_at": datetime.now().isoformat(),
            "app_root": str(app_root),
            "file_count": len(records),
            "has_tests": bool(has_tests),
            "files": records,
        }
        return json.dumps(payload, ensure_ascii=False)

    def parse(self, raw_payload: str) -> list[dict]:
        data = json.loads(raw_payload)
        files = data.get("files", [])
        findings: list[dict] = []

        tsx_files = [f for f in files if f["path"].endswith(".tsx")]
        client_files = [f for f in tsx_files if f.get("is_client_component")]
        large_client_files = sorted(
            [f for f in client_files if f["lines"] >= 260],
            key=lambda x: x["lines"],
            reverse=True,
        )

        if large_client_files:
            top = large_client_files[0]
            findings.append(
                {
                    "specialist": "UI Systems Architect",
                    "priority": "P1",
                    "title": "Componente cliente muito grande para manutencao e evolucao visual",
                    "evidence": f"{top['path']} com {top['lines']} linhas",
                    "recommendation": "Dividir em subcomponentes de apresentacao, hooks de estado e modulo de formatacao para reduzir acoplamento.",
                }
            )

        service_files = [f for f in files if "/services/" in f["path"] and f["path"].endswith(".ts")]
        bulky_services = sorted([f for f in service_files if f["lines"] >= 180], key=lambda x: x["lines"], reverse=True)
        if bulky_services:
            sample = ", ".join(f["path"] for f in bulky_services[:3])
            findings.append(
                {
                    "specialist": "Domain Architect",
                    "priority": "P2",
                    "title": "Servicos com alto volume de regras em um unico arquivo",
                    "evidence": sample,
                    "recommendation": "Separar regras de dominio por capacidade, mantendo interfaces pequenas e validacoes isoladas por modulo.",
                }
            )

        if not data.get("has_tests", False):
            findings.append(
                {
                    "specialist": "Quality Engineer",
                    "priority": "P1",
                    "title": "Ausencia de testes automatizados detectada",
                    "evidence": "Nenhum arquivo *.test.ts ou *.test.tsx encontrado em 04-Codigo-Fonte",
                    "recommendation": "Criar suite minima para motor de calculo e para fluxo critico de paginas de dashboard.",
                }
            )

        all_text = "\n".join(f.get("content", "") for f in files)
        repeated_markers = {
            "LC 214/2025": all_text.count("LC 214/2025"),
            "ATO CONJUNTO RFB/CGIBS": all_text.upper().count("ATO CONJUNTO RFB/CGIBS"),
        }
        repeated_hotspots = [f"{k} ({v}x)" for k, v in repeated_markers.items() if v >= 6]
        if repeated_hotspots:
            findings.append(
                {
                    "specialist": "Design System Specialist",
                    "priority": "P2",
                    "title": "Conteudo regulatorio repetido em varios pontos da interface",
                    "evidence": ", ".join(repeated_hotspots),
                    "recommendation": "Centralizar metadados juridicos em um modulo unico para reduzir divergencia e retrabalho.",
                }
            )

        client_ratio = (len(client_files) / len(tsx_files)) if tsx_files else 0
        if client_ratio >= 0.7:
            findings.append(
                {
                    "specialist": "Performance Engineer",
                    "priority": "P3",
                    "title": "Alta proporcao de componentes client side",
                    "evidence": f"{len(client_files)} de {len(tsx_files)} arquivos TSX marcados como client ({client_ratio:.0%})",
                    "recommendation": "Reavaliar o que pode ser server component para reduzir custo de hidratacao no navegador.",
                }
            )

        if not findings:
            findings.append(
                {
                    "specialist": "System Design Squad",
                    "priority": "P3",
                    "title": "Nenhum risco estrutural critico identificado nesta varredura",
                    "evidence": f"{data.get('file_count', 0)} arquivos avaliados",
                    "recommendation": "Manter revisoes periodicas com baseline de metricas arquiteturais.",
                }
            )

        return findings

    def run(self, supabase_client=None) -> dict:  # noqa: ARG002
        self._results["started_at"] = datetime.now().isoformat()
        logger.info(f"🚀 Iniciando agente: {self.name}")
        logger.info("   Revisao local de design de sistemas em codigo fonte")

        try:
            raw_payload = self.fetch()
            findings = self.parse(raw_payload)

            self._results["fetched"] = len(findings)
            self._results["new"] = 0
            self._results["would_insert"] = len(findings)
            self._results["skipped"] = 0

            payload = json.loads(raw_payload)
            self.report_path = self._write_report(payload, findings)
            logger.info(f"📄 Relatorio gerado: {self.report_path}")

        except Exception as exc:
            self._results["errors"].append(str(exc))
            logger.error(f"💥 Erro no agente {self.name}: {exc}")

        self._results["finished_at"] = datetime.now().isoformat()
        return self._results

    def _write_report(self, payload: dict, findings: list[dict]) -> str:
        reports_dir = self._workspace_root() / "05-Agentes" / "logs" / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)

        now = datetime.now()
        report_file = reports_dir / f"system_design_squad_{now.strftime('%Y-%m-%d_%H%M')}.md"

        lines = [
            "# Relatorio do System Design Squad",
            "",
            f"- Data: {now.strftime('%d/%m/%Y %H:%M')}",
            f"- Escopo: {payload.get('app_root', 'N/A')}",
            f"- Arquivos avaliados: {payload.get('file_count', 0)}",
            "",
            "## Time de especialistas",
            "- UI Systems Architect",
            "- Domain Architect",
            "- Design System Specialist",
            "- Performance Engineer",
            "- Quality Engineer",
            "",
            "## Diagnostico",
        ]

        for idx, finding in enumerate(findings, start=1):
            lines.extend(
                [
                    f"### {idx}. {finding['title']}",
                    f"- Especialista: {finding['specialist']}",
                    f"- Prioridade: {finding['priority']}",
                    f"- Evidencia: {finding['evidence']}",
                    f"- Recomendacao: {finding['recommendation']}",
                    "",
                ]
            )

        report_file.write_text("\n".join(lines), encoding="utf-8")
        return str(report_file)

    def report(self) -> str:
        r = self._results
        lines = [
            f"━━━ Relatorio: {self.name} ━━━",
            "  Tipo: Revisao de design de sistemas (squad)",
            f"  Findings gerados: {r['fetched']}",
            f"  Potenciais saidas: {r['would_insert']}",
            f"  Erros: {len(r['errors'])}",
        ]
        if self.report_path:
            lines.append(f"  Arquivo: {self.report_path}")
        if r["started_at"] and r["finished_at"]:
            lines.append(f"  Inicio: {r['started_at']}")
            lines.append(f"  Fim: {r['finished_at']}")
        return "\n".join(lines)

