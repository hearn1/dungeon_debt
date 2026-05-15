using System;
using UnityEngine;
using UnityEngine.UI;

public class ShopOfferView : MonoBehaviour
{
    private const int Padding = 8;
    private const int ButtonHeight = 48;
    private const int CardHeight = 200;

    [SerializeField] private HeroCardView _heroCardView;
    [SerializeField] private Button _hireButton;
    [SerializeField] private Text _hireLabel;
    [SerializeField] private Text _statusLabel;

    private Action _onHireClicked;
    private Font _font;

    public void Initialize(Font font)
    {
        _font = font;
        BuildUi(font);
    }

    public void SetOnHire(Action onHire)
    {
        _onHireClicked = onHire;
    }

    public void Refresh(ShopOffer offer, int playerGold, bool partyFull)
    {
        if (offer == null || offer.Hero == null)
        {
            _heroCardView.Clear();
            _hireLabel.text = "—";
            _hireButton.interactable = false;
            _statusLabel.text = "Empty";
            return;
        }

        _heroCardView.Refresh(offer.Hero);
        _hireLabel.text = "Hire (" + offer.HireCost + "g)";

        if (offer.Purchased)
        {
            _statusLabel.text = "Hired";
            _hireButton.interactable = false;
        }
        else if (partyFull)
        {
            _statusLabel.text = "Party full";
            _hireButton.interactable = false;
        }
        else if (playerGold < offer.HireCost)
        {
            _statusLabel.text = "Need " + offer.HireCost + "g";
            _hireButton.interactable = false;
        }
        else
        {
            _statusLabel.text = string.Empty;
            _hireButton.interactable = true;
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

        background.color = new Color(0.14f, 0.15f, 0.18f, 1f);
        background.raycastTarget = false;

        GameObject cardObject = new GameObject("HeroCard", typeof(RectTransform));
        RectTransform cardRect = cardObject.GetComponent<RectTransform>();
        cardRect.SetParent(root, false);
        cardRect.anchorMin = new Vector2(0f, 1f);
        cardRect.anchorMax = new Vector2(1f, 1f);
        cardRect.pivot = new Vector2(0.5f, 1f);
        cardRect.offsetMin = new Vector2(Padding, -Padding - CardHeight);
        cardRect.offsetMax = new Vector2(-Padding, -Padding);
        _heroCardView = cardObject.AddComponent<HeroCardView>();
        _heroCardView.Initialize(font);

        _hireButton = CreateButton("HireButton", root, font, "Hire", out _hireLabel);
        RectTransform hireRect = _hireButton.GetComponent<RectTransform>();
        hireRect.anchorMin = new Vector2(0f, 0f);
        hireRect.anchorMax = new Vector2(0.5f, 0f);
        hireRect.pivot = new Vector2(0.5f, 0f);
        hireRect.offsetMin = new Vector2(Padding, Padding);
        hireRect.offsetMax = new Vector2(-Padding, Padding + ButtonHeight);

        _statusLabel = CreateText("Status", root, font, 16, FontStyle.Italic, TextAnchor.MiddleCenter);
        RectTransform statusRect = _statusLabel.rectTransform;
        statusRect.anchorMin = new Vector2(0.5f, 0f);
        statusRect.anchorMax = new Vector2(1f, 0f);
        statusRect.offsetMin = new Vector2(Padding, Padding);
        statusRect.offsetMax = new Vector2(-Padding, Padding + ButtonHeight);

        _hireButton.onClick.AddListener(HandleHireClicked);
    }

    private void OnDestroy()
    {
        if (_hireButton != null)
        {
            _hireButton.onClick.RemoveListener(HandleHireClicked);
        }
    }

    private void HandleHireClicked()
    {
        if (_onHireClicked != null)
        {
            _onHireClicked.Invoke();
        }
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

        labelText = CreateText("Label", rectTransform, font, 18, FontStyle.Bold, TextAnchor.MiddleCenter);
        labelText.text = label;
        labelText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        RectTransform labelRect = labelText.rectTransform;
        labelRect.anchorMin = Vector2.zero;
        labelRect.anchorMax = Vector2.one;
        labelRect.offsetMin = new Vector2(6f, 4f);
        labelRect.offsetMax = new Vector2(-6f, -4f);
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
}
