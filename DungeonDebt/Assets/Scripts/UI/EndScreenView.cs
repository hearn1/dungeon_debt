using System;
using UnityEngine;
using UnityEngine.UI;

public class EndScreenView : MonoBehaviour
{
    private const int Padding = 28;
    private const int TitleFontSize = 48;
    private const int ReasonFontSize = 26;
    private const int StatsFontSize = 24;
    private const int TitleHeight = 64;
    private const int ReasonHeight = 76;
    private const int ButtonWidth = 240;
    private const int ButtonHeight = 64;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _reasonText;
    [SerializeField] private Text _statsText;
    [SerializeField] private Button _newRunButton;
    [SerializeField] private Text _newRunLabel;

    private Action _onNewRun;
    private Action _onContinueAct2;
    private bool _act1ClearHandoff;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Hide();
    }

    public void SetOnNewRun(Action onNewRun)
    {
        _onNewRun = onNewRun;
    }

    public void SetOnContinueAct2(Action onContinueAct2)
    {
        _onContinueAct2 = onContinueAct2;
    }

    public void Show(RunState runState, bool isVictory)
    {
        gameObject.SetActive(true);

        int act = runState != null ? runState.Act : 1;
        _act1ClearHandoff = isVictory && act < GameRules.FinalAct;

        if (_act1ClearHandoff)
        {
            _titleText.text = "Act 1 Clear";
            _titleText.color = new Color(0.7f, 0.92f, 0.62f, 1f);
        }
        else if (isVictory)
        {
            _titleText.text = "Act 2 Complete";
            _titleText.color = new Color(0.7f, 0.92f, 0.62f, 1f);
        }
        else
        {
            _titleText.text = "Defeat";
            _titleText.color = new Color(0.95f, 0.55f, 0.5f, 1f);
        }

        string reason;
        if (_act1ClearHandoff)
        {
            reason = "Act 1 cleared.\nThe rival guilds regroup for Act 2.";
        }
        else if (isVictory)
        {
            reason = "Rival guilds defeated.\nTemporary Act 2 finale - no further content yet.";
        }
        else
        {
            reason = runState != null && !string.IsNullOrEmpty(runState.LatestEndReason)
                ? runState.LatestEndReason
                : "Run ended.";
        }
        _reasonText.text = reason;

        if (runState != null)
        {
            int withinAct = GameRules.GetRoundWithinAct(act, runState.Round);
            int roundsInAct = GameRules.GetRoundsInAct(act);

            _statsText.text =
                GameRules.GetActLabel(act) + " - Round " + withinAct + "/" + roundsInAct + "\n" +
                "Gold: " + runState.Gold + "\n" +
                "Debt: " + runState.Debt + "\n" +
                "Morale: " + runState.Morale;
        }
        else
        {
            _statsText.text = string.Empty;
        }

        if (_newRunButton != null)
        {
            _newRunButton.interactable = true;
            _newRunLabel.text = _act1ClearHandoff ? "Continue to Act 2" : "Main Menu";
        }
    }

    public void Hide()
    {
        gameObject.SetActive(false);
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

        background.color = new Color(0.09f, 0.1f, 0.12f, 0.96f);
        background.raycastTarget = true;

        _titleText = CreateText("Title", root, font, TitleFontSize, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(_titleText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight, -Padding, -Padding);

        _reasonText = CreateText("Reason", root, font, ReasonFontSize, FontStyle.Normal, TextAnchor.MiddleCenter);
        SetAnchoredRect(_reasonText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight - ReasonHeight - 6, -Padding, -Padding - TitleHeight - 6);

        _statsText = CreateText("Stats", root, font, StatsFontSize, FontStyle.Normal, TextAnchor.MiddleCenter);
        SetAnchoredRect(_statsText.rectTransform, 0f, 0f, 1f, 1f, Padding, Padding + ButtonHeight + Padding, -Padding, -Padding - TitleHeight - ReasonHeight - 12);

        _newRunButton = CreateButton("NewRunButton", root, font, "Main Menu", out _newRunLabel);
        SetAnchoredRect(
            _newRunButton.GetComponent<RectTransform>(),
            0.5f, 0f, 0.5f, 0f,
            0f, Padding + (ButtonHeight * 0.5f),
            ButtonWidth, ButtonHeight);
        _newRunButton.onClick.AddListener(HandleNewRunClicked);
    }

    private void OnDestroy()
    {
        if (_newRunButton != null)
        {
            _newRunButton.onClick.RemoveListener(HandleNewRunClicked);
        }
    }

    private void HandleNewRunClicked()
    {
        if (_newRunButton != null)
        {
            _newRunButton.interactable = false;
        }

        if (_act1ClearHandoff)
        {
            if (_onContinueAct2 != null)
            {
                _onContinueAct2.Invoke();
            }

            return;
        }

        if (_onNewRun != null)
        {
            _onNewRun.Invoke();
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

        labelText = CreateText("Label", rectTransform, font, 24, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.text = label;
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        RectTransform labelRect = labelText.rectTransform;
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = new Vector2(8f, 8f);
        labelRect.offsetMax = new Vector2(-8f, -8f);

        return button;
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
