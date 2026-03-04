"""
config.py — Configurações globais do sistema de agentes ATLAS
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from loguru import logger

# Carrega .env local do módulo de agentes e também o .env.local do app web
BASE_DIR = Path(__file__).resolve().parent
APP_DIR = BASE_DIR.parent / "04-Codigo-Fonte"
load_dotenv(BASE_DIR / ".env")
load_dotenv(APP_DIR / ".env.local", override=False)

# --- Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
)


def _is_placeholder(value: str) -> bool:
    normalized = (value or "").strip().upper()
    if not normalized:
        return True
    return "SUA_" in normalized or "_AQUI" in normalized


def get_supabase() -> Client | None:
    """Retorna o cliente Supabase ou None se não configurado."""
    if not _is_placeholder(SUPABASE_URL) and not _is_placeholder(SUPABASE_KEY):
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.warning("⚠️  Supabase não configurado. Verifique o arquivo .env")
    return None

# --- URLs Oficiais ---
RFB_BASE_URL = "https://www.gov.br/receitafederal/pt-br"
RFB_REFORMA_URL = f"{RFB_BASE_URL}/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-consumo"
RFB_NOTICIAS_URL = f"{RFB_REFORMA_URL}/noticias"
RFB_MARCOS_URL = f"{RFB_REFORMA_URL}/marcos"
RFB_ORIENTACOES_URL = f"{RFB_REFORMA_URL}/orientacoes-2026"

# --- Configuração de Logs ---
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

logger.add(
    os.path.join(LOG_DIR, "agentes_{time:YYYY-MM-DD}.log"),
    rotation="1 day",
    retention="30 days",
    level="INFO",
    format="{time:HH:mm:ss} | {level} | {name} | {message}"
)
