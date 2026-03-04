"""
scraper.py — Utilitários de web scraping para os agentes ATLAS
"""

import httpx
from loguru import logger

# Headers que imitam um navegador real (gov.br bloqueia bots simples)
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}


def fetch_page(url: str, timeout: int = 30) -> str | None:
    """
    Busca o conteúdo HTML de uma URL.
    Retorna a string HTML ou None se falhar.
    """
    try:
        logger.debug(f"🌐 GET {url}")
        response = httpx.get(
            url,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
            follow_redirects=True
        )
        response.raise_for_status()
        logger.debug(f"✅ {response.status_code} — {len(response.text)} chars")
        return response.text
    except httpx.TimeoutException:
        logger.error(f"⏱️  Timeout ao acessar {url}")
        return None
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ HTTP {e.response.status_code} ao acessar {url}")
        return None
    except Exception as e:
        logger.error(f"💥 Erro ao acessar {url}: {e}")
        return None
