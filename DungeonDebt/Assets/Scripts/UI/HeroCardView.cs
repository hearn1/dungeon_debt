using UnityEngine;
using UnityEngine.UI;

public class HeroCardView : MonoBehaviour
{
    private const int Padding = 10;
    private const int NameFontSize = 20;
    private const int StatsFontSize = 16;
    private const int EffectFontSize = 14;

    [SerializeField] private Text _nameText;
    [SerializeField] private Text _statsText;
    [SerializeField] private Text _effectText;

    public void Initialize(Font font)
    {
        BuildUi(font);
        Clear();
    }

    public void Refresh(HeroDefinition hero)
    {
        if (hero == null)
        {
            Clear();
            return;
        }

        _nameText.text = hero.DisplayName + " (" + hero.Role + ")";
        _statsText.text = "ATK " + hero.BaseAttack + " / HP " + hero.BaseHealth + " / Upkeep " + hero.BaseUpkeep;
        _effectText.text = hero.EffectDescription;
    }

    public void Clear()
    {
        if (_nameText != null)
        {
            _nameText.text = string.Empty;
        }

        if (_statsText != null)
        {
            _statsText.text = string.Empty;
        }

        if (_effectText != null)
        {
            _effectText.text = string.Empty;
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

        background.color = new Color(0.18f, 0.19f, 0.23f, 1f);
        background.raycastTarget = false;

        _nameText = CreateText("Name", root, font, NameFontSize, FontStyle.Bold, TextAnchor.UpperLeft);
        _statsText = CreateText("Stats", root, font, StatsFontSize, FontStyle.Normal, TextAnchor.UpperLeft);
        _effectText = CreateText("Effect", root, font, EffectFontSize, FontStyle.Italic, TextAnchor.UpperLeft);

        SetAnchored(_nameText.rectTransform, Padding, -Padding - 24, -Padding, -Padding);
        SetAnchored(_statsText.rectTransform, Padding, -Padding - 50, -Padding, -Padding - 26);
        SetAnchored(_effectText.rectTransform, Padding, Padding, -Padding, -Padding - 52);
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
