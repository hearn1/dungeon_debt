using UnityEngine;
using UnityEngine.UI;

public class RunHeaderView : MonoBehaviour
{
    private const int HeaderHeight = 80;
    private const int HorizontalPadding = 32;
    private const int LabelFontSize = 24;

    [SerializeField] private Text _roundText;
    [SerializeField] private Text _goldText;
    [SerializeField] private Text _debtText;
    [SerializeField] private Text _moraleText;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(RunState runState)
    {
        if (runState == null)
        {
            Clear();
            return;
        }

        int act = runState.Act <= 0 ? 1 : runState.Act;
        int roundWithinAct = GameRules.GetRoundWithinAct(act, runState.Round);
        int roundsInAct = GameRules.GetRoundsInAct(act);
        string presetSuffix = string.IsNullOrEmpty(runState.DifficultyDisplayName)
            ? string.Empty
            : " - " + runState.DifficultyDisplayName;
        _roundText.text = GameRules.GetActLabel(act) + " - Round " + roundWithinAct + "/" + roundsInAct + presetSuffix;
        _goldText.text = "Gold " + runState.Gold;
        _debtText.text = "Debt " + runState.Debt + " (" + GameRules.GetDebtStatusLabel(runState.Debt) + ")";
        _moraleText.text = "Morale " + runState.Morale;
    }

    public void Clear()
    {
        _roundText.text = GameRules.GetActLabel(1) + " - Round -/" + GameRules.Act1Rounds;
        _goldText.text = "Gold -";
        _debtText.text = "Debt -";
        _moraleText.text = "Morale -";
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        root.anchorMin = new Vector2(0f, 1f);
        root.anchorMax = new Vector2(1f, 1f);
        root.offsetMin = new Vector2(0f, -HeaderHeight);
        root.offsetMax = Vector2.zero;

        Image background = gameObject.GetComponent<Image>();
        if (background == null)
        {
            background = gameObject.AddComponent<Image>();
        }

        background.color = new Color(0.12f, 0.13f, 0.15f, 1f);
        background.raycastTarget = false;

        RectTransform row = CreateRect("RunHeaderRow", root);
        row.anchorMin = Vector2.zero;
        row.anchorMax = Vector2.one;
        row.offsetMin = new Vector2(HorizontalPadding, 0f);
        row.offsetMax = new Vector2(-HorizontalPadding, 0f);

        _roundText = CreateText("RoundText", row, font, TextAnchor.MiddleLeft);
        _goldText = CreateText("GoldText", row, font, TextAnchor.MiddleCenter);
        _debtText = CreateText("DebtText", row, font, TextAnchor.MiddleCenter);
        _moraleText = CreateText("MoraleText", row, font, TextAnchor.MiddleRight);

        SetColumn(_roundText.rectTransform, 0f, 0.25f);
        SetColumn(_goldText.rectTransform, 0.25f, 0.5f);
        SetColumn(_debtText.rectTransform, 0.5f, 0.75f);
        SetColumn(_moraleText.rectTransform, 0.75f, 1f);
    }

    private static RectTransform CreateRect(string objectName, RectTransform parent)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        return rectTransform;
    }

    private static Text CreateText(string objectName, RectTransform parent, Font font, TextAnchor alignment)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Text textComponent = rectTransform.gameObject.AddComponent<Text>();
        textComponent.font = font;
        textComponent.fontSize = LabelFontSize;
        textComponent.fontStyle = FontStyle.Bold;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static void SetColumn(RectTransform rectTransform, float minX, float maxX)
    {
        rectTransform.anchorMin = new Vector2(minX, 0f);
        rectTransform.anchorMax = new Vector2(maxX, 1f);
        rectTransform.offsetMin = Vector2.zero;
        rectTransform.offsetMax = Vector2.zero;
    }
}
