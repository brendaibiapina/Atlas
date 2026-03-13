#!/usr/bin/env python3
"""
run_ci.py — Executor de agentes para CI

Executa agentes em modo automatizado e retorna exit code != 0
quando um ou mais agentes finalizam com erro.
"""

from __future__ import annotations

import argparse
import importlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from loguru import logger

# Garante paths corretos quando executado no CI
SCRIPT_DIR = Path(__file__).parent.resolve()
os.chdir(SCRIPT_DIR)
sys.path.insert(0, str(SCRIPT_DIR))

from config import get_supabase  # noqa: E402

REGISTRY_PATH = SCRIPT_DIR / "registry.json"


def load_registry() -> dict:
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_agent_instance(agent_config: dict):
    module = importlib.import_module(agent_config["module"])
    cls = getattr(module, agent_config["class"])
    return cls()


def filter_agents(agents: list[dict], mode: str) -> list[dict]:
    enabled = [a for a in agents if a.get("enabled", True)]
    if mode == "entenda":
        return [a for a in enabled if a.get("name") == "rfb_entenda"]
    if mode == "daily":
        return [a for a in enabled if a.get("schedule") == "daily"]
    return enabled


def main() -> int:
    parser = argparse.ArgumentParser(description="Executor CI dos agentes ATLAS")
    parser.add_argument(
        "--mode",
        default="daily",
        choices=["daily", "entenda", "all"],
        help="Seleciona quais agentes devem rodar no CI",
    )
    args = parser.parse_args()

    registry = load_registry()
    selected = filter_agents(registry.get("agents", []), args.mode)
    if not selected:
        logger.error(f"Nenhum agente elegível para mode={args.mode}")
        return 1

    supabase = get_supabase()
    execution_mode = "PERSISTENCIA" if supabase else "DRY-RUN"
    logger.info("=" * 64)
    logger.info(f"ATLAS CI Runner iniciado em {datetime.now().isoformat(timespec='seconds')}")
    logger.info(f"Modo: {args.mode} | Execucao: {execution_mode} | Agentes: {len(selected)}")
    logger.info("=" * 64)

    failed = 0
    for agent_config in selected:
        name = agent_config.get("name", "unknown")
        logger.info(f"▶ Executando agente: {name}")
        try:
            agent = get_agent_instance(agent_config)
            result = agent.run(supabase)
            error_count = len(result.get("errors", []))
            if error_count > 0:
                failed += 1
                logger.error(f"✖ {name} finalizou com {error_count} erro(s)")
            else:
                fetched = result.get("fetched", 0)
                new = result.get("new", 0)
                would_insert = result.get("would_insert", 0)
                logger.info(
                    f"✔ {name} concluído | extraidos={fetched} inseridos={new} potenciais={would_insert}"
                )
        except Exception as exc:
            failed += 1
            logger.exception(f"✖ Falha não tratada no agente {name}: {exc}")

    if failed > 0:
        logger.error(f"Finalizado com falhas: {failed}/{len(selected)} agente(s)")
        return 1

    logger.info(f"Finalizado com sucesso: {len(selected)} agente(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
