using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PayrollPanelView : MonoBehaviour
{
    private const int CardWidth = 320;
    private const int CardHeight = 220;
    private const int CardGap = 28;
    private const int TitleHeight = 36;
    private const int TitleTopOffset = 20;
    private const int HintHeight = 22;
    private const int CardsRowTopOffset = 96;
    private const int ContinueButtonWidth = 260;
    private const int ContinueButtonHeight = 60;
    private const int ContinueButtonTopGap = 30;

    [SerializeField] private Button _continueButton;
    [SerializeField] private Text _continueLabel;
    [SerializeField] private PayrollCardView[] _cards;

    private Font _font;
    private Action<PayrollActionId?> _onSelect;
    private Action _onContinue;
    private IReadOnlyList<PayrollActionDefinition> _actions;
    private PayrollActionId? _selectedAction;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi();
        Hide();
    }

    public void SetActions(IReadOnlyList<PayrollActionDefinition> actions)
    {
        _actions = actions;
    }

    public void SetHandlers(Action<PayrollActionId?> onSelect, Action onContinue)
    {
        _onSelect = onSelect;
        _onContinue = onContinue;
    }

    public void Show()
    {
        gameObject.SetActive(true);
    }

    public void Hide()
    {
        gameObject.SetActive(false);
    }

    public void Refresh(PayrollActionId? selectedAction)
    {
        _selectedAction = selectedAction;

        if (_actions == null)
        {
            return;
        }

        for (int i = 0; i < _cards.Length; i++)
        {
            if (i < _actions.Count)
            {
                PayrollActionDefinition definition = _actions[i];
                bool isSelected = selectedAction.HasValue && selectedAction.Value == definition.Id;
                _cards[i].SetAction(definition, isSelected);
            }
        }

        _continueButton.interactable = selectedAction.HasValue;
    }

    private void OnDestroy()
    {
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveListener(HandleContinueClicked);
        }
    }

    private void HandleCardClicked(PayrollActionId actionId)
    {
        bool isDeselect = _selectedAction.HasValue && _selectedAction.Value == actionId;
        PayrollActionId? next = isDeselect ? (PayrollActionId?)null : actionId;
        if (_onSelect != null)
        {
            _onSelect(next);
        }
    }

    private void HandleContinueClicked()
    {
        if (_onContinue != null)
        {
            _onContinue();
        }
    }

    private void BuildUi()
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

        background.color = new Color(0.11f, 0.12f, 0.15f, 1f);
        background.raycastTarget = false;

        Text titleText = CreateText("Title", root, _font, 28, FontStyle.Bold, TextAnchor.MiddleCenter);
        AnchorTopCentered(titleText.rectTransform, 700f, TitleHeight, TitleTopOffset);
        titleText.text = "Payroll — choose one action for this fight";

        Text hintText = CreateText("Hint", root, _font, 18, FontStyle.Italic, TextAnchor.MiddleCenter);
        AnchorTopCentered(hintText.rectTransform, 700f, HintHeight, TitleTopOffset + TitleHeight + 2);
        hintText.text = "Click a card to select; click the selected card again to cancel.";
        hintText.color = new Color(0.75f, 0.76f, 0.7f, 1f);

        int cardCount = 4;
        _cards = new PayrollCardView[cardCount];
        int rowWidth = (CardWidth * cardCount) + (CardGap * (cardCount - 1));

        for (int i = 0; i < cardCount; i++)
        {
            PayrollCardView card = CreateCard(root, i);
            float x = (-rowWidth * 0.5f) + (i * (CardWidth + CardGap)) + (CardWidth * 0.5f);
            AnchorTopAt(card.GetComponent<RectTransform>(), x, CardWidth, CardHeight, CardsRowTopOffset);
            _cards[i] = card;
        }

        int continueTop = CardsRowTopOffset + CardHeight + ContinueButtonTopGap;
        _continueButton = CreateContinueButton(root, _font, "Continue to Combat");
        AnchorTopCentered(_continueButton.GetComponent<RectTransform>(), ContinueButtonWidth, ContinueButtonHeight, continueTop);
        _continueButton.onClick.AddListener(HandleContinueClicked);
        _continueButton.interactable = false;
    }

    private PayrollCardView CreateCard(RectTransform parent, int index)
    {
        GameObject cardObject = new GameObject("PayrollCard" + index, typeof(RectTransform));
        RectTransform cardRect = cardObject.GetComponent<RectTransform>();
        cardRect.SetParent(parent, false);

        PayrollCardView cardView = cardObject.AddComponent<PayrollCardView>();
        cardView.Initialize(_font, HandleCardClicked);
        return cardView;
    }

    private Button CreateContinueButton(RectTransform parent, Font font, string label)
    {
        GameObject buttonObject = new GameObject("ContinueButton", typeof(RectTransform));
        RectTransform rectTransform = buttonObject.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = buttonObject.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = buttonObject.AddComponent<Button>();
        button.targetGraphic = image;

        _continueLabel = CreateText("Label", rectTransform, font, 22, FontStyle.Bold, TextAnchor.MiddleCenter);
        _continueLabel.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        _continueLabel.text = label;
        RectTransform textRect = _continueLabel.rectTransform;
        textRect.anchorMin = new Vector2(0f, 0f);
        textRect.anchorMax = new Vector2(1f, 1f);
        textRect.offsetMin = new Vector2(12f, 8f);
        textRect.offsetMax = new Vector2(-12f, -8f);

        return button;
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

    private static void AnchorTopCentered(RectTransform rectTransform, float width, float height, float topOffset)
    {
        rectTransform.anchorMin = new Vector2(0.5f, 1f);
        rectTransform.anchorMax = new Vector2(0.5f, 1f);
        rectTransform.pivot = new Vector2(0.5f, 1f);
        rectTransform.anchoredPosition = new Vector2(0f, -topOffset);
        rectTransform.sizeDelta = new Vector2(width, height);
    }

    private static void AnchorTopAt(RectTransform rectTransform, float xCenter, float width, float height, float topOffset)
    {
        rectTransform.anchorMin = new Vector2(0.5f, 1f);
        rectTransform.anchorMax = new Vector2(0.5f, 1f);
        rectTransform.pivot = new Vector2(0.5f, 1f);
        rectTransform.anchoredPosition = new Vector2(xCenter, -topOffset);
        rectTransform.sizeDelta = new Vector2(width, height);
    }
}
