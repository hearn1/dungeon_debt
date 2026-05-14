using System;
using UnityEngine;
using UnityEngine.UI;

public class PayrollCardView : MonoBehaviour
{
    private const int Padding = 14;
    private const int TitleFontSize = 22;
    private const int DescriptionFontSize = 16;
    private const int HighlightThickness = 4;

    private static readonly Color DefaultColor = new Color(0.18f, 0.2f, 0.25f, 1f);
    private static readonly Color DisabledColor = new Color(0.12f, 0.13f, 0.15f, 1f);
    private static readonly Color HighlightColor = new Color(0.95f, 0.78f, 0.25f, 1f);
    private static readonly Color HighlightHiddenColor = new Color(0f, 0f, 0f, 0f);

    [SerializeField] private Button _button;
    [SerializeField] private Image _background;
    [SerializeField] private Image _highlight;
    [SerializeField] private Text _titleText;
    [SerializeField] private Text _descriptionText;

    private PayrollActionId _actionId;
    private Action<PayrollActionId> _onClick;

    public PayrollActionId ActionId
    {
        get { return _actionId; }
    }

    public void Initialize(Font font, Action<PayrollActionId> onClick)
    {
        _onClick = onClick;
        BuildUi(font);
        _button.onClick.AddListener(HandleClick);
        SetSelected(false);
    }

    public void SetAction(PayrollActionDefinition definition, bool selected)
    {
        _actionId = definition.Id;
        _titleText.text = definition.DisplayName;
        _descriptionText.text = definition.Description;
        SetSelected(selected);
    }

    public void SetSelected(bool selected)
    {
        _highlight.color = selected ? HighlightColor : HighlightHiddenColor;
    }

    public void SetInteractable(bool interactable)
    {
        if (_button != null)
        {
            _button.interactable = interactable;
        }
        if (_background != null)
        {
            _background.color = interactable ? DefaultColor : DisabledColor;
        }
    }

    private void OnDestroy()
    {
        if (_button != null)
        {
            _button.onClick.RemoveListener(HandleClick);
        }
    }

    private void HandleClick()
    {
        if (_onClick != null)
        {
            _onClick(_actionId);
        }
    }

    private void BuildUi(Font font)
    {
        RectTransform root = GetComponent<RectTransform>();
        if (root == null)
        {
            root = gameObject.AddComponent<RectTransform>();
        }

        _highlight = CreatePanel("Highlight", root, HighlightHiddenColor).GetComponent<Image>();
        RectTransform highlightRect = _highlight.GetComponent<RectTransform>();
        highlightRect.anchorMin = new Vector2(0f, 0f);
        highlightRect.anchorMax = new Vector2(1f, 1f);
        highlightRect.offsetMin = new Vector2(-HighlightThickness, -HighlightThickness);
        highlightRect.offsetMax = new Vector2(HighlightThickness, HighlightThickness);
        _highlight.raycastTarget = false;

        _background = CreatePanel("Background", root, DefaultColor).GetComponent<Image>();
        RectTransform backgroundRect = _background.GetComponent<RectTransform>();
        backgroundRect.anchorMin = new Vector2(0f, 0f);
        backgroundRect.anchorMax = new Vector2(1f, 1f);
        backgroundRect.offsetMin = Vector2.zero;
        backgroundRect.offsetMax = Vector2.zero;
        _background.raycastTarget = true;

        _button = _background.gameObject.AddComponent<Button>();
        _button.targetGraphic = _background;

        _titleText = CreateText("Title", backgroundRect, font, TitleFontSize, FontStyle.Bold, TextAnchor.UpperCenter);
        SetAnchored(_titleText.rectTransform, Padding, -Padding - 38, -Padding, -Padding);

        _descriptionText = CreateText("Description", backgroundRect, font, DescriptionFontSize, FontStyle.Normal, TextAnchor.UpperLeft);
        SetAnchored(_descriptionText.rectTransform, Padding, Padding, -Padding, -Padding - 44);
        _descriptionText.color = new Color(0.85f, 0.87f, 0.82f, 1f);
    }

    private static RectTransform CreatePanel(string objectName, RectTransform parent, Color color)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = child.AddComponent<Image>();
        image.color = color;
        return rectTransform;
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

    private static void SetAnchored(RectTransform rectTransform, float left, float bottom, float right, float top)
    {
        rectTransform.anchorMin = new Vector2(0f, 0f);
        rectTransform.anchorMax = new Vector2(1f, 1f);
        rectTransform.offsetMin = new Vector2(left, bottom);
        rectTransform.offsetMax = new Vector2(right, top);
    }
}
