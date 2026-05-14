using UnityEngine;
using UnityEngine.UI;

public class RewardSummaryView : MonoBehaviour
{
    private const int TitleFontSize = 28;
    private const int BodyFontSize = 22;
    private const int Padding = 24;
    private const int TitleHeight = 44;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _bodyText;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(RunState runState)
    {
        if (runState == null || !runState.HasLatestRewardSummary)
        {
            Clear();
            return;
        }

        _titleText.text = "Reward Summary";
        _bodyText.text =
            "Combat: " + (runState.LatestCombatWon ? "Win" : "Loss") + "\n" +
            "Gold gained: +" + runState.LatestRewardGold + "\n" +
            "Morale change: " + FormatSigned(runState.LatestMoraleChange) + "\n" +
            "Payroll effect: None\n" +
            "Upkeep due: " + runState.LatestTotalUpkeep + "\n" +
            "Upkeep paid: " + runState.LatestUpkeepPaid + "\n" +
            "Upkeep shortfall: " + runState.LatestUpkeepShortfall + "\n" +
            "Interest charged: " + runState.LatestInterestCharged + "\n" +
            "Interest paid: " + runState.LatestInterestPaid + "\n" +
            "Interest to debt: " + runState.LatestInterestAddedToDebt + "\n" +
            "Final: Gold " + runState.Gold + " / Debt " + runState.Debt + " / Morale " + runState.Morale;
    }

    public void Clear()
    {
        if (_titleText != null)
        {
            _titleText.text = "Reward Summary";
        }

        if (_bodyText != null)
        {
            _bodyText.text = "Complete combat to see reward, upkeep, interest, and final resources.";
        }
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        Image background = gameObject.GetComponent<Image>();
        if (background == null)
        {
            background = gameObject.AddComponent<Image>();
        }

        background.color = new Color(0.13f, 0.14f, 0.17f, 1f);
        background.raycastTarget = false;

        _titleText = CreateText("Title", root, font, TitleFontSize, FontStyle.Bold, TextAnchor.MiddleLeft);
        _bodyText = CreateText("Body", root, font, BodyFontSize, FontStyle.Normal, TextAnchor.UpperLeft);

        SetAnchoredRect(_titleText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight, -Padding, -Padding);
        SetAnchoredRect(_bodyText.rectTransform, 0f, 0f, 1f, 1f, Padding, Padding, -Padding, -Padding - TitleHeight);
    }

    private static Text CreateText(string objectName, RectTransform parent, Font font, int fontSize, FontStyle fontStyle, TextAnchor alignment)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);

        Text textComponent = child.AddComponent<Text>();
        textComponent.font = font;
        textComponent.fontSize = fontSize;
        textComponent.fontStyle = fontStyle;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static string FormatSigned(int value)
    {
        if (value > 0)
        {
            return "+" + value;
        }

        return value.ToString();
    }

    private static void SetAnchoredRect(RectTransform rectTransform, float anchorMinX, float anchorMinY, float anchorMaxX, float anchorMaxY, float leftOrCenterX, float bottomOrCenterY, float rightOrWidth, float topOrHeight)
    {
        rectTransform.anchorMin = new Vector2(anchorMinX, anchorMinY);
        rectTransform.anchorMax = new Vector2(anchorMaxX, anchorMaxY);

        if (anchorMinX == anchorMaxX && anchorMinY == anchorMaxY)
        {
            rectTransform.anchoredPosition = new Vector2(leftOrCenterX, bottomOrCenterY);
            rectTransform.sizeDelta = new Vector2(rightOrWidth, topOrHeight);
            return;
        }

        rectTransform.offsetMin = new Vector2(leftOrCenterX, bottomOrCenterY);
        rectTransform.offsetMax = new Vector2(rightOrWidth, topOrHeight);
    }
}
