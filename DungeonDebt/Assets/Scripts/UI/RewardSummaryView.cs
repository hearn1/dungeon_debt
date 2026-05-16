using System;
using UnityEngine;
using UnityEngine.UI;

public class RewardSummaryView : MonoBehaviour
{
    private const int TitleFontSize = 28;
    private const int BodyFontSize = 20;
    private const int Padding = 24;
    private const int TitleHeight = 44;
    private const int ContinueButtonHeight = 56;
    private const int ContinueButtonWidth = 220;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _bodyText;
    [SerializeField] private Button _continueButton;
    [SerializeField] private Text _continueButtonLabel;

    private Action _onContinue;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void SetOnContinue(Action onContinue)
    {
        _onContinue = onContinue;
    }

    public void Refresh(RunState runState)
    {
        if (runState == null || !runState.HasLatestRewardSummary)
        {
            Clear();
            return;
        }

        _titleText.text = "Reward Summary";

        string payrollSection = string.Empty;
        if (!string.IsNullOrEmpty(runState.LatestPayrollSummary))
        {
            payrollSection = runState.LatestPayrollSummary + "\n";
        }

        string relicSection = string.Empty;
        if (runState.ActiveRelics.Count > 0)
        {
            relicSection = "Active relics: " + FormatActiveRelics(runState) + "\n";
            if (runState.LatestRelicRewardGold > 0)
            {
                relicSection += "Relic bonus: +" + runState.LatestRelicRewardGold + " gold\n";
            }
        }

        string debtWarning = string.Empty;
        if (GameRules.IsHighDebtPressure(runState.Debt))
        {
            debtWarning = "\nHigh debt increases interest pressure and can interact badly with debt-scaling threats.";
        }

        _bodyText.text =
            "Combat: " + (runState.LatestCombatWon ? "Win" : "Loss") + "\n" +
            "Gold gained: +" + runState.LatestRewardGold + "\n" +
            "Morale change: " + FormatSigned(runState.LatestMoraleChange) + "\n" +
            payrollSection +
            relicSection +
            "Upkeep due: " + runState.LatestTotalUpkeep + "\n" +
            "Upkeep paid: " + runState.LatestUpkeepPaid + "\n" +
            "Upkeep shortfall: " + runState.LatestUpkeepShortfall + "\n" +
            "Interest charged: " + runState.LatestInterestCharged + "\n" +
            "Interest paid: " + runState.LatestInterestPaid + "\n" +
            "Interest to debt: " + runState.LatestInterestAddedToDebt + "\n" +
            "Debt status: " + GameRules.GetDebtStatusLabel(runState.Debt) + "\n" +
            "Final: Gold " + runState.Gold + " / Debt " + runState.Debt + " / Morale " + runState.Morale +
            debtWarning;

        if (_continueButton != null)
        {
            _continueButton.gameObject.SetActive(true);
            _continueButton.interactable = true;
            _continueButtonLabel.text = "Continue";
        }
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

        if (_continueButton != null)
        {
            _continueButton.gameObject.SetActive(false);
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
        SetAnchoredRect(_bodyText.rectTransform, 0f, 0f, 1f, 1f, Padding, Padding + ContinueButtonHeight + Padding, -Padding, -Padding - TitleHeight);

        _continueButton = CreateButton("ContinueButton", root, font, "Continue", out _continueButtonLabel);
        SetAnchoredRect(
            _continueButton.GetComponent<RectTransform>(),
            0.5f, 0f, 0.5f, 0f,
            0f, Padding + (ContinueButtonHeight * 0.5f),
            ContinueButtonWidth, ContinueButtonHeight);
        _continueButton.onClick.AddListener(HandleContinueClicked);
        _continueButton.gameObject.SetActive(false);
    }

    private void OnDestroy()
    {
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveListener(HandleContinueClicked);
        }
    }

    private void HandleContinueClicked()
    {
        if (_continueButton != null)
        {
            _continueButton.interactable = false;
        }

        if (_onContinue != null)
        {
            _onContinue.Invoke();
        }
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

    private static Button CreateButton(string objectName, RectTransform parent, Font font, string label, out Text labelText)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);

        Image image = child.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = child.AddComponent<Button>();
        button.targetGraphic = image;

        labelText = CreateText("Label", rectTransform, font, 22, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.text = label;
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        RectTransform labelRect = labelText.rectTransform;
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = new Vector2(8f, 6f);
        labelRect.offsetMax = new Vector2(-8f, -6f);

        return button;
    }

    private static string FormatSigned(int value)
    {
        if (value > 0)
        {
            return "+" + value;
        }

        return value.ToString();
    }

    private static string FormatActiveRelics(RunState runState)
    {
        string text = string.Empty;
        for (int i = 0; i < runState.ActiveRelics.Count; i++)
        {
            if (i > 0)
            {
                text += ", ";
            }

            text += DataRepository.GetRelic(runState.ActiveRelics[i]).DisplayName;
        }

        return text;
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
