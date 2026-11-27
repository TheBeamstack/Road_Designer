# SPDX-License-Identifier: LicenseRef-BCL-1.1
# SPDX-FileCopyrightText: 2026 Beamstack <https://beam-stack.com>
"""The frozen Streamlit app points its users at the maintained SPA (T-003).

Read as source: streamlit is not in the test environment's requirements.
"""
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "frontends" / "streamlit" / "app.py"
SPA = "https://rd.beam-stack.com"


def test_notice_links_spa_above_generate_button():
    src = APP.read_text(encoding="utf-8")
    assert SPA in src
    assert src.index(SPA) < src.index('"🚀 Générer"')
