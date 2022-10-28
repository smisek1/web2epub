import get_html
import database
import pytest
def test_osel():
    linky = database.select_linky_pro_testing()
    for b in linky.clanky:
        # with pytest.raises(Exception):
            a = get_html.get_html_osel (b[0])
            assert isinstance(a.nadpis,str)