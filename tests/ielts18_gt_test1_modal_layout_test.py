from pathlib import Path
import unittest


ADAPTER = Path("general-training/cambridge-18/test-1/study-feedback.js")


class IELTS18GTTest1ModalLayoutTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.adapter = ADAPTER.read_text(encoding="utf-8")

    def test_header_does_not_force_nowrap_onto_dialog_descendants(self):
        self.assertNotIn(
            ".gt18-test1-header-right{gap:12px;min-width:0;flex:0 0 auto;white-space:nowrap}",
            self.adapter,
        )
        self.assertIn(
            ".gt18-test1-header-right{gap:12px;min-width:0;flex:0 0 auto}",
            self.adapter,
        )

    def test_reading_overlays_reset_inherited_white_space(self):
        self.assertIn(
            ".gt18-test1-header-right .reading-shell-score-guide-backdrop,"
            ".gt18-test1-header-right .reading-shell-answer-key-backdrop,"
            ".gt18-test1-header-right .reading-shell-score-feedback-backdrop{white-space:normal}",
            self.adapter,
        )

    def test_modal_flex_and_grid_children_can_shrink(self):
        self.assertIn(
            ".gt18-test1-header-right .reading-shell-score-feedback-card{min-width:0}",
            self.adapter,
        )

    def test_score_feedback_sentences_wrap_inside_cards(self):
        self.assertIn(
            ".gt18-test1-header-right .reading-shell-score-feedback-text,"
            ".gt18-test1-header-right .reading-shell-score-feedback-part-score"
            "{white-space:normal;overflow-wrap:anywhere}",
            self.adapter,
        )


if __name__ == "__main__":
    unittest.main()
