using System;
using UnityEngine;
using UnityEngine.UI;

public class RelicRewardPanelView : MonoBehaviour
{
    private const int Padding = 28;
    private const int TitleHeight = 48;
    private const int BodyHeight = 92;
    private const int ChoiceButtonHeight = 82;
    private const int ChoiceGap = 16;
    private const int ActiveHeight = 56;
    private const int ChoiceCount = 3;

    [SerializeField] private Text _titleText;
    [SerializeField] private Text _bodyText;
    [SerializeField] private Text _activeText;

    private readonly Button[] _choiceButtons = new Button[ChoiceCount];
    private readonly Text[] _choiceLabels = new Text[ChoiceCount];
    private readonly RelicId[] _choiceIds = new RelicId[ChoiceCount];
    private Action<RelicId> _onSelect;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Hide();
    }

    public void SetOnSelect(Action<RelicId> onSelect)
    {
        _onSelect = onSelect;
    }

    public void Refresh(RunState runState)
    {
        if (runState == null || !runState.HasPendingRelicReward)
        {
            Hide();
            return;
        }

        _titleText.text = "Choose a Relic";
        _bodyText.text = "Your guild recovered one lasting run modifier from the boss fight. Pick one.";
        _activeText.text = "Active relics: " + FormatActiveRelics(runState);

        for (int i = 0; i < _choiceButtons.Length; i++)
        {
            bool hasChoice = i < runState.PendingRelicChoices.Count;
            _choiceButtons[i].gameObject.SetActive(hasChoice);
            _choiceButtons[i].interactable = hasChoice;
            if (!hasChoice)
            {
                continue;
            }

            RelicDefinition relic = DataRepository.GetRelic(runState.PendingRelicChoices[i]);
            _choiceIds[i] = relic.Id;
            _choiceLabels[i].text = relic.DisplayName + "\n" + relic.EffectDescription;
        }

        Show();
    }

    public void Show()
    {
        gameObject.SetActive(true);
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

        background.color = new Color(0.13f, 0.14f, 0.17f, 1f);
        background.raycastTarget = false;

        _titleText = CreateText("Title", root, font, 30, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(_titleText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight, -Padding, -Padding);

        _bodyText = CreateText("Body", root, font, 20, FontStyle.Normal, TextAnchor.UpperCenter);
        SetAnchoredRect(_bodyText.rectTransform, 0f, 1f, 1f, 1f, Padding, -Padding - TitleHeight - BodyHeight, -Padding, -Padding - TitleHeight);

        float firstChoiceCenterY = -Padding - TitleHeight - BodyHeight - (ChoiceButtonHeight * 0.5f);
        for (int i = 0; i < _choiceButtons.Length; i++)
        {
            _choiceButtons[i] = CreateButton("ChoiceButton" + i, root, font, out _choiceLabels[i]);
            float centerY = firstChoiceCenterY - (i * (ChoiceButtonHeight + ChoiceGap));
            SetAnchoredRect(_choiceButtons[i].GetComponent<RectTransform>(), 0.5f, 1f, 0.5f, 1f, 0f, centerY, 560f, ChoiceButtonHeight);
            int choiceIndex = i;
            _choiceButtons[i].onClick.AddListener(delegate { HandleChoiceClicked(choiceIndex); });
        }

        _activeText = CreateText("ActiveRelics", root, font, 18, FontStyle.Normal, TextAnchor.MiddleCenter);
        SetAnchoredRect(_activeText.rectTransform, 0f, 0f, 1f, 0f, Padding, Padding, -Padding, Padding + ActiveHeight);
    }

    private void HandleChoiceClicked(int choiceIndex)
    {
        for (int i = 0; i < _choiceButtons.Length; i++)
        {
            if (_choiceButtons[i] != null)
            {
                _choiceButtons[i].interactable = false;
            }
        }

        if (_onSelect != null)
        {
            _onSelect.Invoke(_choiceIds[choiceIndex]);
        }
    }

    private static string FormatActiveRelics(RunState runState)
    {
        if (runState == null || runState.ActiveRelics.Count <= 0)
        {
            return "none";
        }

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

    private static Button CreateButton(string objectName, RectTransform parent, Font font, out Text labelText)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);

        Image image = child.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = child.AddComponent<Button>();
        button.targetGraphic = image;

        labelText = CreateText("Label", rectTransform, font, 20, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        SetAnchoredRect(labelText.rectTransform, 0f, 0f, 1f, 1f, 16f, 8f, -16f, -8f);
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
