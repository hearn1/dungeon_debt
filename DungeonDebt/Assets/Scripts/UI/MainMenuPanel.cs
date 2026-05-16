using UnityEngine;
using UnityEngine.UI;

public class MainMenuPanel : MonoBehaviour
{
    private const int HorizontalMargin = 140;
    private const int TopMargin = 130;
    private const int ButtonWidth = 260;
    private const int ButtonHeight = 64;
    private const int ButtonGap = 28;
    private const int StatusTopOffset = 205;
    private const int ButtonRowTopOffset = 300;
    private const int ReferenceHeight = 1080;
    private const int CombatLogTopOffset = 380;
    // Combat-only: the combat panel reclaims the top chrome (big title +
    // status + Start/Restart row, all occluded by the opaque combat panel
    // while it is active) so the card grid can grow. The scrolling log and
    // every non-combat panel keep CombatLogTopOffset and do not move.
    private const int CombatScreenTopOffset = 64;
    private const int CombatHeaderTop = 96;
    private const int CombatHeaderHeight = 48;
    private const int CompactRestartWidth = 180;
    private const int CompactRestartHeight = 40;
    private const int CombatUnitPanelHeight = 510;
    private const int CombatPanelLogGap = 16;
    private const int CombatLogStreamingTopOffset = CombatLogTopOffset + CombatUnitPanelHeight + CombatPanelLogGap;
    private const int RewardSummaryWidth = 520;
    private const int RewardSummaryHeight = 460;
    private const int EndScreenWidth = 640;
    private const int EndScreenHeight = 460;
    private const int LogScrollbarWidth = 14;
    private const int LogContentPadding = 24;
    private const int RivalLeaderboardWidth = 520;
    private const int RivalLeaderboardHeight = 240;
    private const int RivalContinueButtonWidth = 260;
    private const int RivalContinueButtonHeight = 60;

    [SerializeField] private GameManager _gameManager;
    [SerializeField] private RunManager _runManager;
    [SerializeField] private RunHeaderView _runHeaderView;
    [SerializeField] private Button _startCombatButton;
    [SerializeField] private Button _restartButton;
    [SerializeField] private Text _statusText;
    [SerializeField] private Text _resultText;
    [SerializeField] private CombatPanelView _combatPanelView;
    [SerializeField] private CombatLogView _combatLogView;
    [SerializeField] private RewardSummaryView _rewardSummaryView;
    [SerializeField] private EndScreenView _endScreenView;
    [SerializeField] private ShopPanelView _shopPanelView;
    [SerializeField] private FormationPanelView _formationPanelView;
    [SerializeField] private PayrollPanelView _payrollPanelView;
    [SerializeField] private ScoutPanelView _scoutPanelView;
    [SerializeField] private RivalLeaderboardView _rivalLeaderboardView;
    [SerializeField] private Button _rivalContinueButton;
    [SerializeField] private SpriteCatalog _spriteCatalog;
    [SerializeField] private RectTransform _combatHeaderRoot;
    [SerializeField] private Text _combatHeaderStatus;
    [SerializeField] private Button _combatHeaderRestartButton;

    private static Font _runtimeFont;


    private void Awake()
    {
        EnsureCoreSystems();
        BuildUi();
        _gameManager.OnStateChanged += HandleStateChanged;
        _startCombatButton.onClick.AddListener(StartCombat);
        _restartButton.onClick.AddListener(RestartCombat);
        _rewardSummaryView.SetOnContinue(HandleContinueClicked);
        _endScreenView.SetOnNewRun(HandleNewRunClicked);
        _shopPanelView.SetHandlers(HandleHireClicked, HandleFireClicked, HandleRerollClicked, HandleShopContinueClicked);
        _formationPanelView.SetHandlers(HandleFormationSwap, HandleFormationContinue);
        _payrollPanelView.SetActions(DataRepository.AllPayrollActions);
        _payrollPanelView.SetHandlers(HandlePayrollSelect, HandlePayrollContinue);
        _scoutPanelView.SetOnContinue(HandleScoutContinueClicked);
        _rivalContinueButton.onClick.AddListener(HandleRivalContinueClicked);
        ResetUi();
    }

    private void OnDestroy()
    {
        if (_gameManager != null)
        {
            _gameManager.OnStateChanged -= HandleStateChanged;
        }

        if (_startCombatButton != null)
        {
            _startCombatButton.onClick.RemoveListener(StartCombat);
        }

        if (_restartButton != null)
        {
            _restartButton.onClick.RemoveListener(RestartCombat);
        }

        if (_rivalContinueButton != null)
        {
            _rivalContinueButton.onClick.RemoveListener(HandleRivalContinueClicked);
        }

        if (_combatHeaderRestartButton != null)
        {
            _combatHeaderRestartButton.onClick.RemoveListener(RestartCombat);
        }
    }

    private void StartCombat()
    {
        _gameManager.StartRun();
    }

    private void RestartCombat()
    {
        _gameManager.StartRun();
    }

    private void HandleContinueClicked()
    {
        _gameManager.ContinueAfterReward();
    }

    private void HandleNewRunClicked()
    {
        _gameManager.StartRun();
    }

    private void HandleHireClicked(int offerIndex)
    {
        ShopManager shopManager = _gameManager.ShopManager;
        if (shopManager == null)
        {
            return;
        }

        shopManager.Hire(offerIndex);
        RefreshShop();
    }

    private void HandleFireClicked(int partyIndex)
    {
        ShopManager shopManager = _gameManager.ShopManager;
        if (shopManager == null)
        {
            return;
        }

        shopManager.Fire(partyIndex);
        RefreshShop();
    }

    private void HandleRerollClicked()
    {
        ShopManager shopManager = _gameManager.ShopManager;
        if (shopManager == null)
        {
            return;
        }

        shopManager.Reroll();
        RefreshShop();
    }

    private void HandleShopContinueClicked()
    {
        _gameManager.ContinueFromShop();
    }

    private void HandleFormationSwap(int slotA, int slotB)
    {
        if (_runManager == null)
        {
            return;
        }

        _runManager.SwapPartySlots(slotA, slotB);
        _formationPanelView.Refresh(_gameManager.CurrentRunState);
    }

    private void HandleFormationContinue()
    {
        _gameManager.ContinueFromFormation();
    }

    private void HandlePayrollSelect(PayrollActionId? actionId)
    {
        _gameManager.SelectPayrollAction(actionId);
        _payrollPanelView.Refresh(_gameManager.CurrentRunState);
    }

    private void HandlePayrollContinue()
    {
        _gameManager.ContinueFromPayroll();
    }

    private void HandleScoutContinueClicked()
    {
        _gameManager.ContinueFromScout();
    }

    private void HandleRivalContinueClicked()
    {
        _gameManager.ContinueFromRivalUpdate();
    }

    private void RefreshShop()
    {
        RunState runState = _gameManager.CurrentRunState;
        _runHeaderView.Refresh(runState);
        _shopPanelView.Refresh(runState, _gameManager.ShopManager.CurrentOffers);
    }

    private void SetCombatChromeVisible(bool visible)
    {
        if (_combatHeaderRoot != null)
        {
            _combatHeaderRoot.gameObject.SetActive(visible);
        }
    }

    private void ResetUi()
    {
        SetCombatChromeVisible(false);
        _statusText.text = "Ready";
        _resultText.text = string.Empty;
        _startCombatButton.interactable = true;
        _restartButton.interactable = false;
        _combatLogView.Clear();
        _rewardSummaryView.Clear();
        _runHeaderView.Clear();
        _endScreenView.Hide();
        _shopPanelView.Hide();
        _formationPanelView.Hide();
        _payrollPanelView.Hide();
        _scoutPanelView.Hide();
        _rivalLeaderboardView.Hide();
        _rivalContinueButton.gameObject.SetActive(false);
        _combatPanelView.Hide();
    }

    private void RunSandboxCombat()
    {
        _startCombatButton.interactable = false;
        _restartButton.interactable = false;
        _statusText.text = "Combat running...";
        if (_combatHeaderStatus != null)
        {
            _combatHeaderStatus.text = "Combat running...";
        }
        _resultText.text = string.Empty;
        _combatLogView.Clear();
        _combatPanelView.Clear();
        _combatPanelView.Show();
        _rewardSummaryView.Clear();
        _endScreenView.Hide();
        _shopPanelView.Hide();
        _formationPanelView.Hide();
        _payrollPanelView.Hide();
        _scoutPanelView.Hide();
        _rivalLeaderboardView.Hide();
        _rivalContinueButton.gameObject.SetActive(false);

        RunState run = _gameManager.CurrentRunState;
        _runHeaderView.Refresh(run);
        EncounterDefinition encounter = run != null && run.CurrentEncounter != null
            ? run.CurrentEncounter
            : DataRepository.SandboxEncounter;
        CombatResult result = new CombatManager().StartCombat(run, encounter);
        _combatPanelView.Refresh(result.PlayerStartUnits, result.EnemyStartUnits);

        _combatLogView.StreamReplay(result.ReplayEvents, _combatPanelView.ApplyReplayEvent, delegate
        {
            _combatPanelView.ClearAllActing();
            _combatPanelView.Refresh(result.PlayerFinalUnits, result.EnemyFinalUnits);
            _gameManager.ChangeState(GameState.Reward);
            _runManager.ApplyPostCombatResult(result, encounter);
            _gameManager.ChangeState(GameState.Upkeep);
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _rewardSummaryView.Refresh(_gameManager.CurrentRunState);
            _statusText.text = "Combat complete. Press Continue.";
            if (_combatHeaderStatus != null)
            {
                _combatHeaderStatus.text = "Combat complete. Press Continue.";
            }
            _resultText.text = result.PlayerWon ? "Result: Player wins!" : "Result: Player loses.";
            _restartButton.interactable = true;
        });
    }

    private void HandleStateChanged(GameState gameState)
    {
        if (gameState == GameState.StartRun)
        {
            SetCombatChromeVisible(false);
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            _resultText.text = string.Empty;
            return;
        }

        if (gameState == GameState.Scout)
        {
            SetCombatChromeVisible(false);
            _statusText.text = "Scout. Review the encounter, then Continue.";
            _resultText.text = string.Empty;
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _scoutPanelView.Refresh(_gameManager.CurrentRunState);
            _scoutPanelView.Show();
            _rivalLeaderboardView.Refresh(_gameManager.CurrentRunState, true);
            _rivalLeaderboardView.Show();
            _rivalContinueButton.gameObject.SetActive(false);
            _startCombatButton.interactable = false;
            _restartButton.interactable = true;
            return;
        }

        if (gameState == GameState.Shop)
        {
            SetCombatChromeVisible(false);
            _statusText.text = "Shop. Hire heroes, then Continue.";
            _resultText.text = string.Empty;
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _shopPanelView.Refresh(_gameManager.CurrentRunState, _gameManager.ShopManager.CurrentOffers);
            _shopPanelView.Show();
            _startCombatButton.interactable = false;
            _restartButton.interactable = true;
            return;
        }

        if (gameState == GameState.Formation)
        {
            SetCombatChromeVisible(false);
            _statusText.text = "Formation. Click two slots to swap, then Continue.";
            _resultText.text = string.Empty;
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _shopPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _formationPanelView.Refresh(_gameManager.CurrentRunState);
            _formationPanelView.Show();
            _startCombatButton.interactable = false;
            _restartButton.interactable = true;
            return;
        }

        if (gameState == GameState.Payroll)
        {
            SetCombatChromeVisible(false);
            _statusText.text = "Payroll. Choose one action, then Continue.";
            _resultText.text = string.Empty;
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            RunState payrollRun = _gameManager.CurrentRunState;
            if (payrollRun != null)
            {
                payrollRun.SelectedPayrollAction = null;
            }
            _runHeaderView.Refresh(payrollRun);
            _payrollPanelView.Refresh(payrollRun);
            _payrollPanelView.Show();
            _startCombatButton.interactable = false;
            _restartButton.interactable = true;
            return;
        }

        if (gameState == GameState.Combat)
        {
            SetCombatChromeVisible(true);
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            RunSandboxCombat();
            return;
        }

        if (gameState == GameState.RivalUpdate)
        {
            SetCombatChromeVisible(false);
            _statusText.text = "Rivals updated. Review the leaderboard, then Continue.";
            _resultText.text = string.Empty;
            _combatLogView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _rewardSummaryView.Clear();
            _endScreenView.Hide();
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _runHeaderView.Refresh(_gameManager.CurrentRunState);
            _rivalLeaderboardView.Refresh(_gameManager.CurrentRunState, false);
            _rivalLeaderboardView.Show();
            _rivalContinueButton.gameObject.SetActive(true);
            _rivalContinueButton.interactable = true;
            _startCombatButton.interactable = false;
            _restartButton.interactable = true;
            return;
        }

        if (gameState == GameState.Victory || gameState == GameState.Defeat)
        {
            SetCombatChromeVisible(false);
            _statusText.text = gameState == GameState.Victory ? "Run won." : "Run lost.";
            _rewardSummaryView.Clear();
            _combatPanelView.Clear();
            _combatPanelView.Hide();
            _shopPanelView.Hide();
            _formationPanelView.Hide();
            _payrollPanelView.Hide();
            _scoutPanelView.Hide();
            _rivalLeaderboardView.Hide();
            _rivalContinueButton.gameObject.SetActive(false);
            _endScreenView.Show(_gameManager.CurrentRunState, gameState == GameState.Victory);
            _restartButton.interactable = true;
        }
    }

    private void EnsureCoreSystems()
    {
        _runManager = GetComponent<RunManager>();
        if (_runManager == null)
        {
            _runManager = gameObject.AddComponent<RunManager>();
        }

        _gameManager = GetComponent<GameManager>();
        if (_gameManager == null)
        {
            _gameManager = gameObject.AddComponent<GameManager>();
        }

        _gameManager.Initialize(_runManager);
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

        background.color = new Color(0.09f, 0.1f, 0.12f, 1f);
        background.raycastTarget = false;

        RectTransform headerRect = CreateRect("RunHeader", root);
        _runHeaderView = headerRect.gameObject.AddComponent<RunHeaderView>();
        _runHeaderView.Initialize(GetRuntimeFont());

        Text titleText = CreateText("Title", root, "Dungeon Debt", 56, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(titleText.rectTransform, 0.5f, 1f, 0.5f, 1f, 0f, -TopMargin, 720f, 76f);

        _statusText = CreateText("StatusText", root, "Ready", 26, FontStyle.Normal, TextAnchor.MiddleCenter);
        SetAnchoredRect(_statusText.rectTransform, 0.5f, 1f, 0.5f, 1f, 0f, -StatusTopOffset, 700f, 44f);

        RectTransform buttonRow = CreateRect("ButtonRow", root);
        SetAnchoredRect(buttonRow, 0.5f, 1f, 0.5f, 1f, 0f, -ButtonRowTopOffset, (ButtonWidth * 2) + ButtonGap, ButtonHeight);

        _startCombatButton = CreateButton("StartCombatButton", buttonRow, "Start Run");
        SetAnchoredRect(_startCombatButton.GetComponent<RectTransform>(), 0f, 0.5f, 0f, 0.5f, ButtonWidth * 0.5f, 0f, ButtonWidth, ButtonHeight);

        _restartButton = CreateButton("RestartButton", buttonRow, "Restart Sandbox");
        SetAnchoredRect(_restartButton.GetComponent<RectTransform>(), 1f, 0.5f, 1f, 0.5f, -ButtonWidth * 0.5f, 0f, ButtonWidth, ButtonHeight);

        RectTransform combatPanel = CreateRect("CombatPanel", root);
        SetAnchoredRect(
            combatPanel,
            0f, 0f, 1f, 1f,
            HorizontalMargin,
            ReferenceHeight - CombatLogTopOffset - CombatUnitPanelHeight,
            -HorizontalMargin - RewardSummaryWidth - ButtonGap,
            -CombatScreenTopOffset);
        _combatPanelView = combatPanel.gameObject.AddComponent<CombatPanelView>();
        _combatPanelView.Initialize(GetRuntimeFont(), _spriteCatalog);
        _combatPanelView.Hide();

        // Compact combat header. The enlarged combat panel is opaque and drawn
        // after the shared title/status/Start-Restart row, so during combat
        // those are occluded; this right-column strip restores a status readout
        // and Restart control without covering the persistent run header.
        _combatHeaderRoot = CreatePanel("CombatHeader", root, new Color(0.12f, 0.13f, 0.16f, 1f));
        SetAnchoredRect(
            _combatHeaderRoot,
            1f, 1f, 1f, 1f,
            -HorizontalMargin - (RewardSummaryWidth * 0.5f),
            -(CombatHeaderTop + (CombatHeaderHeight * 0.5f)),
            RewardSummaryWidth,
            CombatHeaderHeight);

        _combatHeaderStatus = CreateText("CombatHeaderStatus", _combatHeaderRoot, string.Empty, 18, FontStyle.Bold, TextAnchor.MiddleLeft);
        SetAnchoredRect(_combatHeaderStatus.rectTransform, 0f, 0f, 1f, 1f, 8f, 0f, -(CompactRestartWidth + 24f), 0f);

        _combatHeaderRestartButton = CreateButton("CombatHeaderRestart", _combatHeaderRoot, "Restart");
        SetAnchoredRect(
            _combatHeaderRestartButton.GetComponent<RectTransform>(),
            1f, 0.5f, 1f, 0.5f,
            -(CompactRestartWidth * 0.5f) - 4f,
            0f,
            CompactRestartWidth,
            CompactRestartHeight);
        _combatHeaderRestartButton.onClick.AddListener(RestartCombat);
        _combatHeaderRoot.gameObject.SetActive(false);

        RectTransform logPanel = CreatePanel("CombatLogPanel", root, new Color(0.16f, 0.17f, 0.2f, 1f));
        SetAnchoredRect(logPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin - RewardSummaryWidth - ButtonGap, -CombatLogStreamingTopOffset);

        ScrollRect scrollRect = logPanel.gameObject.AddComponent<ScrollRect>();
        scrollRect.horizontal = false;
        scrollRect.vertical = true;
        scrollRect.movementType = ScrollRect.MovementType.Clamped;
        scrollRect.scrollSensitivity = 24f;

        RectTransform viewport = CreateRect("Viewport", logPanel);
        SetAnchoredRect(viewport, 0f, 0f, 1f, 1f, 0f, 0f, -(LogScrollbarWidth + 4f), 0f);
        Image viewportImage = viewport.gameObject.AddComponent<Image>();
        viewportImage.color = new Color(1f, 1f, 1f, 0f);
        viewportImage.raycastTarget = true;
        viewport.gameObject.AddComponent<RectMask2D>();

        RectTransform content = CreateRect("Content", viewport);
        content.anchorMin = new Vector2(0f, 1f);
        content.anchorMax = new Vector2(1f, 1f);
        content.pivot = new Vector2(0.5f, 1f);
        content.anchoredPosition = Vector2.zero;
        content.sizeDelta = new Vector2(0f, 0f);
        VerticalLayoutGroup contentLayout = content.gameObject.AddComponent<VerticalLayoutGroup>();
        contentLayout.padding = new RectOffset(LogContentPadding, LogContentPadding, LogContentPadding, LogContentPadding);
        contentLayout.childAlignment = TextAnchor.UpperLeft;
        contentLayout.childControlWidth = true;
        contentLayout.childControlHeight = true;
        contentLayout.childForceExpandWidth = true;
        contentLayout.childForceExpandHeight = false;
        ContentSizeFitter contentFitter = content.gameObject.AddComponent<ContentSizeFitter>();
        contentFitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
        contentFitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

        Text logText = CreateText("CombatLogText", content, string.Empty, 24, FontStyle.Normal, TextAnchor.UpperLeft);
        logText.verticalOverflow = VerticalWrapMode.Overflow;

        RectTransform scrollbarRect = CreatePanel("VerticalScrollbar", logPanel, new Color(0.1f, 0.11f, 0.13f, 1f));
        scrollbarRect.anchorMin = new Vector2(1f, 0f);
        scrollbarRect.anchorMax = new Vector2(1f, 1f);
        scrollbarRect.pivot = new Vector2(1f, 0.5f);
        scrollbarRect.anchoredPosition = Vector2.zero;
        scrollbarRect.sizeDelta = new Vector2(LogScrollbarWidth, 0f);
        Image scrollbarImage = scrollbarRect.GetComponent<Image>();
        scrollbarImage.raycastTarget = true;
        Scrollbar verticalScrollbar = scrollbarRect.gameObject.AddComponent<Scrollbar>();
        verticalScrollbar.direction = Scrollbar.Direction.BottomToTop;

        RectTransform slidingArea = CreateRect("SlidingArea", scrollbarRect);
        SetAnchoredRect(slidingArea, 0f, 0f, 1f, 1f, 2f, 2f, -2f, -2f);
        RectTransform handleRect = CreatePanel("Handle", slidingArea, new Color(0.55f, 0.5f, 0.35f, 1f));
        handleRect.anchorMin = new Vector2(0f, 0f);
        handleRect.anchorMax = new Vector2(1f, 1f);
        handleRect.offsetMin = Vector2.zero;
        handleRect.offsetMax = Vector2.zero;
        Image handleImage = handleRect.GetComponent<Image>();
        handleImage.raycastTarget = true;
        verticalScrollbar.targetGraphic = handleImage;
        verticalScrollbar.handleRect = handleRect;

        scrollRect.viewport = viewport;
        scrollRect.content = content;
        scrollRect.verticalScrollbar = verticalScrollbar;
        scrollRect.verticalScrollbarVisibility = ScrollRect.ScrollbarVisibility.Permanent;

        _combatLogView = logPanel.gameObject.AddComponent<CombatLogView>();
        _combatLogView.Initialize(logText, scrollRect);

        RectTransform rewardSummaryPanel = CreatePanel("RewardSummaryPanel", root, new Color(0.13f, 0.14f, 0.17f, 1f));
        SetAnchoredRect(rewardSummaryPanel, 1f, 0.5f, 1f, 0.5f, -HorizontalMargin - (RewardSummaryWidth * 0.5f), -45f, RewardSummaryWidth, RewardSummaryHeight);

        _rewardSummaryView = rewardSummaryPanel.gameObject.AddComponent<RewardSummaryView>();
        _rewardSummaryView.Initialize(GetRuntimeFont());

        _resultText = CreateText("ResultText", root, string.Empty, 32, FontStyle.Bold, TextAnchor.MiddleCenter);
        SetAnchoredRect(_resultText.rectTransform, 0.5f, 0f, 0.5f, 0f, 0f, 45f, 800f, 52f);

        RectTransform endScreenPanel = CreateRect("EndScreenPanel", root);
        SetAnchoredRect(endScreenPanel, 0.5f, 0.5f, 0.5f, 0.5f, 0f, 0f, EndScreenWidth, EndScreenHeight);
        _endScreenView = endScreenPanel.gameObject.AddComponent<EndScreenView>();
        _endScreenView.Initialize(GetRuntimeFont());

        RectTransform shopPanel = CreateRect("ShopPanel", root);
        SetAnchoredRect(shopPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin, -CombatLogTopOffset);
        _shopPanelView = shopPanel.gameObject.AddComponent<ShopPanelView>();
        _shopPanelView.Initialize(GetRuntimeFont());
        _shopPanelView.Hide();

        RectTransform formationPanel = CreateRect("FormationPanel", root);
        SetAnchoredRect(formationPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin, -CombatLogTopOffset);
        _formationPanelView = formationPanel.gameObject.AddComponent<FormationPanelView>();
        _formationPanelView.Initialize(GetRuntimeFont());
        _formationPanelView.Hide();

        RectTransform payrollPanel = CreateRect("PayrollPanel", root);
        SetAnchoredRect(payrollPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin, -CombatLogTopOffset);
        _payrollPanelView = payrollPanel.gameObject.AddComponent<PayrollPanelView>();
        _payrollPanelView.Initialize(GetRuntimeFont());
        _payrollPanelView.Hide();

        RectTransform scoutPanel = CreateRect("ScoutPanel", root);
        SetAnchoredRect(scoutPanel, 0f, 0f, 1f, 1f, HorizontalMargin, 100f, -HorizontalMargin, -CombatLogTopOffset);
        _scoutPanelView = scoutPanel.gameObject.AddComponent<ScoutPanelView>();
        _scoutPanelView.Initialize(GetRuntimeFont());
        _scoutPanelView.Hide();

        RectTransform rivalLeaderboardPanel = CreatePanel("RivalLeaderboardPanel", root, new Color(0.12f, 0.13f, 0.16f, 1f));
        SetAnchoredRect(
            rivalLeaderboardPanel,
            1f, 0f, 1f, 0f,
            -HorizontalMargin - (RivalLeaderboardWidth * 0.5f),
            230f,
            RivalLeaderboardWidth,
            RivalLeaderboardHeight);
        _rivalLeaderboardView = rivalLeaderboardPanel.gameObject.AddComponent<RivalLeaderboardView>();
        _rivalLeaderboardView.Initialize(GetRuntimeFont());
        _rivalLeaderboardView.Hide();

        _rivalContinueButton = CreateButton("RivalContinueButton", root, "Continue to Scout");
        SetAnchoredRect(
            _rivalContinueButton.GetComponent<RectTransform>(),
            1f, 0f, 1f, 0f,
            -HorizontalMargin - (RivalContinueButtonWidth * 0.5f),
            72f,
            RivalContinueButtonWidth,
            RivalContinueButtonHeight);
        _rivalContinueButton.gameObject.SetActive(false);
    }

    private static RectTransform CreateRect(string objectName, RectTransform parent)
    {
        GameObject child = new GameObject(objectName, typeof(RectTransform));
        RectTransform rectTransform = child.GetComponent<RectTransform>();
        rectTransform.SetParent(parent, false);
        return rectTransform;
    }

    private static RectTransform CreatePanel(string objectName, RectTransform parent, Color color)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Image image = rectTransform.gameObject.AddComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
        return rectTransform;
    }

    private static Text CreateText(string objectName, RectTransform parent, string text, int fontSize, FontStyle fontStyle, TextAnchor alignment)
    {
        RectTransform rectTransform = CreateRect(objectName, parent);
        Text textComponent = rectTransform.gameObject.AddComponent<Text>();
        textComponent.font = GetRuntimeFont();
        textComponent.text = text;
        textComponent.fontSize = fontSize;
        textComponent.fontStyle = fontStyle;
        textComponent.alignment = alignment;
        textComponent.color = new Color(0.93f, 0.94f, 0.9f, 1f);
        textComponent.horizontalOverflow = HorizontalWrapMode.Wrap;
        textComponent.verticalOverflow = VerticalWrapMode.Truncate;
        textComponent.raycastTarget = false;
        return textComponent;
    }

    private static Font GetRuntimeFont()
    {
        if (_runtimeFont != null)
        {
            return _runtimeFont;
        }

        _runtimeFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (_runtimeFont == null)
        {
            _runtimeFont = Font.CreateDynamicFontFromOSFont(new[] { "Arial", "Segoe UI", "Liberation Sans" }, 16);
        }

        return _runtimeFont;
    }

    private static Button CreateButton(string objectName, RectTransform parent, string label)
    {
        RectTransform rectTransform = CreatePanel(objectName, parent, new Color(0.78f, 0.69f, 0.41f, 1f));
        Button button = rectTransform.gameObject.AddComponent<Button>();
        Image buttonImage = rectTransform.GetComponent<Image>();
        buttonImage.raycastTarget = true;
        button.targetGraphic = buttonImage;

        Text buttonText = CreateText("Label", rectTransform, label, 24, FontStyle.Bold, TextAnchor.MiddleCenter);
        buttonText.color = new Color(0.08f, 0.08f, 0.09f, 1f);
        SetAnchoredRect(buttonText.rectTransform, 0f, 0f, 1f, 1f, 12f, 8f, -12f, -8f);

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
