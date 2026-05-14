using System;
using UnityEngine;
using UnityEngine.UI;

public class FormationPanelView : MonoBehaviour
{
    private const int SlotWidth = 220;
    private const int SlotHeight = 160;
    private const int SlotGap = 28;
    private const int RowGap = 50;
    private const int SectionLabelHeight = 28;
    private const int SectionLabelGap = 6;
    private const int ContinueButtonWidth = 260;
    private const int ContinueButtonHeight = 60;
    private const int ContinueButtonTopGap = 30;
    private const int TitleHeight = 36;
    private const int TitleTopOffset = 20;
    private const int HintHeight = 22;

    [SerializeField] private Button _continueButton;
    [SerializeField] private Text _hintText;
    [SerializeField] private FormationSlotView[] _slots;

    private Font _font;
    private Action<int, int> _onSwap;
    private Action _onContinue;
    private int _selectedSlot = -1;

    public void Initialize(Font font)
    {
        _font = font;
        _slots = new FormationSlotView[GameRules.MaxPartySize];
        BuildUi();
        Refresh(null);
        Hide();
    }

    public void SetHandlers(Action<int, int> onSwap, Action onContinue)
    {
        _onSwap = onSwap;
        _onContinue = onContinue;
    }

    public void Show()
    {
        gameObject.SetActive(true);
    }

    public void Hide()
    {
        ClearSelection();
        gameObject.SetActive(false);
    }

    public void Refresh(RunState runState)
    {
        HeroInstance[] occupants = new HeroInstance[GameRules.MaxPartySize];
        if (runState != null)
        {
            for (int i = 0; i < runState.Party.Count; i++)
            {
                HeroInstance hero = runState.Party[i];
                if (hero.FormationSlot >= 0 && hero.FormationSlot < GameRules.MaxPartySize)
                {
                    occupants[hero.FormationSlot] = hero;
                }
            }
        }

        for (int slot = 0; slot < _slots.Length; slot++)
        {
            _slots[slot].Refresh(occupants[slot]);
            _slots[slot].SetSelected(slot == _selectedSlot);
        }
    }

    private void OnDestroy()
    {
        if (_continueButton != null)
        {
            _continueButton.onClick.RemoveListener(HandleContinueClicked);
        }
    }

    private void HandleSlotClicked(int slotIndex)
    {
        if (_selectedSlot == -1)
        {
            if (!IsSlotOccupied(slotIndex))
            {
                return;
            }

            _selectedSlot = slotIndex;
            _slots[slotIndex].SetSelected(true);
            return;
        }

        if (_selectedSlot == slotIndex)
        {
            ClearSelection();
            return;
        }

        int slotA = _selectedSlot;
        int slotB = slotIndex;
        ClearSelection();

        if (_onSwap != null)
        {
            _onSwap(slotA, slotB);
        }
    }

    private void HandleContinueClicked()
    {
        ClearSelection();
        if (_onContinue != null)
        {
            _onContinue();
        }
    }

    private bool IsSlotOccupied(int slotIndex)
    {
        return _slots[slotIndex] != null && _slots[slotIndex].IsOccupied;
    }

    private void ClearSelection()
    {
        if (_selectedSlot != -1 && _slots != null && _selectedSlot < _slots.Length && _slots[_selectedSlot] != null)
        {
            _slots[_selectedSlot].SetSelected(false);
        }

        _selectedSlot = -1;
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
        AnchorTopCentered(titleText.rectTransform, 600f, TitleHeight, TitleTopOffset);
        titleText.text = "Formation — click two slots to swap";

        Text hintText = CreateText("Hint", root, _font, 18, FontStyle.Italic, TextAnchor.MiddleCenter);
        AnchorTopCentered(hintText.rectTransform, 600f, HintHeight, TitleTopOffset + TitleHeight + 2);
        hintText.text = "Click a slot to select it; click again to cancel.";
        hintText.color = new Color(0.75f, 0.76f, 0.7f, 1f);
        _hintText = hintText;

        int frontlineRowTop = TitleTopOffset + TitleHeight + HintHeight + 18;
        Text frontLabel = CreateText("FrontlineLabel", root, _font, 20, FontStyle.Bold, TextAnchor.MiddleCenter);
        AnchorTopCentered(frontLabel.rectTransform, 400f, SectionLabelHeight, frontlineRowTop);
        frontLabel.text = "Frontline (slots 0–" + (GameRules.FrontlineSlots - 1) + ")";
        frontLabel.color = new Color(0.95f, 0.83f, 0.5f, 1f);

        int frontlineSlotsTop = frontlineRowTop + SectionLabelHeight + SectionLabelGap;
        int frontlineRowWidth = (SlotWidth * GameRules.FrontlineSlots) + (SlotGap * (GameRules.FrontlineSlots - 1));
        for (int i = 0; i < GameRules.FrontlineSlots; i++)
        {
            int slotIndex = i;
            FormationSlotView slot = CreateSlot(root, slotIndex);
            float x = (-frontlineRowWidth * 0.5f) + (i * (SlotWidth + SlotGap)) + (SlotWidth * 0.5f);
            AnchorTopAt(slot.GetComponent<RectTransform>(), x, SlotWidth, SlotHeight, frontlineSlotsTop);
            slot.SetSlotLabel("F" + slotIndex);
            _slots[slotIndex] = slot;
        }

        int backlineRowTop = frontlineSlotsTop + SlotHeight + RowGap;
        Text backLabel = CreateText("BacklineLabel", root, _font, 20, FontStyle.Bold, TextAnchor.MiddleCenter);
        AnchorTopCentered(backLabel.rectTransform, 400f, SectionLabelHeight, backlineRowTop);
        backLabel.text = "Backline (slots " + GameRules.FrontlineSlots + "–" + (GameRules.MaxPartySize - 1) + ")";
        backLabel.color = new Color(0.65f, 0.78f, 0.95f, 1f);

        int backlineSlotsTop = backlineRowTop + SectionLabelHeight + SectionLabelGap;
        int backlineRowWidth = (SlotWidth * GameRules.BacklineSlots) + (SlotGap * (GameRules.BacklineSlots - 1));
        for (int i = 0; i < GameRules.BacklineSlots; i++)
        {
            int slotIndex = GameRules.FrontlineSlots + i;
            FormationSlotView slot = CreateSlot(root, slotIndex);
            float x = (-backlineRowWidth * 0.5f) + (i * (SlotWidth + SlotGap)) + (SlotWidth * 0.5f);
            AnchorTopAt(slot.GetComponent<RectTransform>(), x, SlotWidth, SlotHeight, backlineSlotsTop);
            slot.SetSlotLabel("B" + slotIndex);
            _slots[slotIndex] = slot;
        }

        int continueTop = backlineSlotsTop + SlotHeight + ContinueButtonTopGap;
        _continueButton = CreateContinueButton(root, _font, "Continue to Combat");
        AnchorTopCentered(_continueButton.GetComponent<RectTransform>(), ContinueButtonWidth, ContinueButtonHeight, continueTop);
        _continueButton.onClick.AddListener(HandleContinueClicked);
    }

    private FormationSlotView CreateSlot(RectTransform parent, int slotIndex)
    {
        GameObject slotObject = new GameObject("Slot" + slotIndex, typeof(RectTransform));
        RectTransform slotRect = slotObject.GetComponent<RectTransform>();
        slotRect.SetParent(parent, false);

        FormationSlotView slotView = slotObject.AddComponent<FormationSlotView>();
        slotView.Initialize(slotIndex, _font, HandleSlotClicked);
        return slotView;
    }

    private static Button CreateContinueButton(RectTransform parent, Font font, string label)
    {
        GameObject buttonObject = new GameObject("ContinueButton", typeof(RectTransform));
        RectTransform rectTransform = buttonObject.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        Image image = buttonObject.AddComponent<Image>();
        image.color = new Color(0.78f, 0.69f, 0.41f, 1f);
        image.raycastTarget = true;

        Button button = buttonObject.AddComponent<Button>();
        button.targetGraphic = image;

        Text buttonText = CreateText("Label", rectTransform, font, 22, FontStyle.Bold, TextAnchor.MiddleCenter);
        buttonText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        buttonText.text = label;
        RectTransform textRect = buttonText.rectTransform;
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
