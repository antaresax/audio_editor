// 디버그 정보
PM.DEBUG = false;

/*
    URL Info
*/

/*
// 프론트에서 사용. 캔버스는 상관안함 ............................................................................

// 업로드 및 장바구니추가 URL
PM.URL.UPLOAD        = "http://tplx.photomon.com/upload/flex_webimage.asp";
PM.URL.ADD_CART      = "http://www.photomon.com/StoryAlbum/CardEditor/add_cart_ok.asp";

// 목록 URL
PM.URL.THEME_LIST    = "http://tpl.photomon.com/Product/skin/mainxml/flex_photobook_stylethumb.xml";
PM.URL.LAYOUT_LIST   = "http://tpl.photomon.com/Product/skin/mainxml/flex_photobook_layouturl.xml";
PM.URL.SKIN_LIST     = "http://tpl.photomon.com/Product/skin/mainxml/flex_photobook_backgroundurl.xml";
PM.URL.STICKER_LIST  = "http://tpl.photomon.com/Product/catalog/mainxml/flex_stickdnurl.20130904.xml";
PM.URL.FRAME_LIST    = "http://tpl.photomon.com/Product/catalog/mainxml/flex_frameurl.xml";

// 썸네일 URL
PM.URL.LAYOUT_THUMB  = "http://tpl.photomon.com/product/skin/thumb/";
PM.URL.SKIN_THUMB    = "http://tpl.photomon.com/Product/skin/flex_skinthumb/";
PM.URL.STICKER_THUMB = "http://tpl.photomon.com/Product/clipart20120430/thumb/";
PM.URL.FRAME_THUMB   = "http://tpl.photomon.com/Product/clipart20120430/thumb/"; 

// .......................................................................................................
*/

// 포토북 코디(편집)정보 URL (param: depth1=couple&depth2=Romance&productOption1=8x8_newdesign)
PM.URL.PHOTOBOOK_THEME  = "http://tpl.photomon.com/Product/skin/mainxml/flex_photobook_productbook_div_utf8.asp?";
PM.URL.PHOTOBOOK_LAYOUT = "http://tpl.photomon.com/product/skin/thumb/";
PM.URL.PHOTOBOOK_SKIN   = "http://tpl.photomon.com/product/skin/edit/";

// 캘린더 코디(편집)정보 URL (param: productcode=139080)
PM.URL.CALENDAR_THEME   = "http://tpl.photomon.com/product/cal25/themesxml/themes.asp?";
PM.URL.CALENDAR_LAYOUT  = "http://tpl.photomon.com/product/cal25/skins/";
PM.URL.CALENDAR_SKIN    = "http://tpl.photomon.com/product/cal25/skins/";

// 포토북/캘린더 레이아웃 URL (PM.Editor.Framework에서 Product 종류에 따라 초기화할 것.)
PM.URL.LAYOUT_FILE   = "";
PM.URL.SKIN_FILE     = "";
PM.URL.STICKER_FILE  = "http://tpl.photomon.com/Product/clipart20120430/edit/";
PM.URL.FRAME_FILE    = "http://tpl.photomon.com/Product/clipart20120430/edit/";

/*
    config
*/
PM.CONFIG.SCALE_MIN = 0.3;
PM.CONFIG.SCALE_MAX = 2.0;

PM.CONFIG.CANVAS_MARGIN_W = 120;
PM.CONFIG.CANVAS_MARGIN_H = 120;

//PM.CONFIG.TBOX_MARGIN_H = 5;

PM.CONFIG.PHOTO_MIN_DPI = 150; // dpi

PM.CONFIG.GRID_COLOR = "#777777";
PM.CONFIG.GRID_LINEW = 0.5;
PM.CONFIG.GRID_SPACE = 10;

PM.CONFIG.CONTROLLER_RADIUS = 8;
PM.CONFIG.CROP_RADIUS = 22;

PM.CONFIG.PHOTO_MAX = 25; // 한페이지당 사진레이어 최대 개수 제한

PM.CONFIG.GUIDE_COLOR = "#ff0000";
PM.CONFIG.GUIDE_LINEW = 1;
PM.CONFIG.GUIDE_EXTRA = 32; // line overhang
PM.CONFIG.GUIDE_FONT = "16px Nanum Gothic";
PM.CONFIG.GUIDE_FONT_H = 16; // 16px
PM.CONFIG.GUIDE_TEXT_COLOR = "#000000";
PM.CONFIG.GUIDE_TEXT_MARGIN = 10;
PM.CONFIG.GUIDE_LEATHERCOVER_TEXT = "커버내 사각홈에 보여지는 사진은 실제 제작시 1~3mm 정도 오차가 발생할 수 있습니다."

PM.CONFIG.PROLOG_FONT = "16pt Nanum Gothic";
PM.CONFIG.PROLOG_COLOR = "#bbbbbb";
PM.CONFIG.PROLOG_TEXT = "인쇄되지 않는 페이지입니다.";

PM.CONFIG.BOOT_FONT = "14pt Nanum Gothic";
PM.CONFIG.BOOT_COLOR = "#bbbbbb";
PM.CONFIG.BOOT_LOADING_MSG = "상품정보를 불러오는 중...";
PM.CONFIG.BOOT_FAILURE_MSG = "상품정보를 정상적으로 불러오지 못했습니다.";
PM.CONFIG.BOOT_LOADING = 0;
PM.CONFIG.BOOT_SUCCESS = 1;
PM.CONFIG.BOOT_FAILURE = -1;

PM.CONFIG.MESSAGE_ONLINE = "인터넷이 연결되었습니다.";
PM.CONFIG.MESSAGE_OFFLINE = "인터넷이 연결되지 않았습니다.";
PM.CONFIG.MESSAGE_CANNOT_ADD = "추가를 할 수 없습니다.";
PM.CONFIG.MESSAGE_CHECK_IME = "macOS에서는 영문모드 상태에서만 입력 가능합니다. (영문모드 상태에서 Shift+Space로 한/영 전환)";
PM.CONFIG.MESSAGE_CHECK_TEXT_LEN = "글상자의 내용이 범위를 넘어섭니다. 글꼴 크기를 줄이거나 글 내용을 줄여주시기 바랍니다.";
PM.CONFIG.MESSAGE_CHECK_TEXT_SIZE = "글상자의 크기가 범위를 넘어섭니다. 글상자의 크기를 줄여주시기 바랍니다.";
PM.CONFIG.MESSAGE_CHECK_PROLOG_AREA = "인쇄되지 않는 페이지를 침범한 레이어 영역은 인쇄되지 않습니다.";
PM.CONFIG.MESSAGE_CHECK_SPINE_AREA = "커버의 책등(세네카)영역과 겹치지 않게 편집해 주십시오.";

PM.CONFIG.MESSAGEBAR_TIMEOUT = 3000;
PM.CONFIG.MESSAGEBAR_FONT = "10pt Nanum Gothic";//"bold 10pt Nanum Gothic";
PM.CONFIG.MESSAGEBAR_TEXTCOLOR = "#111111";
PM.CONFIG.MESSAGEBAR_BACKCOLOR = "#ffff00";
PM.CONFIG.MESSAGEBAR_HEIGHT = 30;

PM.CONFIG.ROUNDMASK_IMAGE = "http://tpl.photomon.com/Product/clipart20120430/edit/frame_diagram_56.png";
PM.CONFIG.FRAME_EMPTY_IMAGE = "frame_diagram_delete.png";

PM.CONFIG.COVER_BARCODE_IMAGE = "./images/common/cover_barcode.jpg";
PM.CONFIG.PAGE_GRADATION_IMAGE = "./images/common/page_gradation.png";
PM.CONFIG.PHOTO_EMPTY_IMAGE = "./images/common/photo_empty.png";
PM.CONFIG.PHOTO_WARNING_IMAGE = "./images/common/photo_warning.png";
// http://www.photomon.com/photobook/html5/images/common/xxxxxx

/*
    "Nanum Gothic":        "http://fonts.googleapis.com/earlyaccess/nanumgothic.css",
    "Nanum Myeongjo":      "http://fonts.googleapis.com/earlyaccess/nanummyeongjo.css",
    "Nanum Pen Script":    "http://fonts.googleapis.com/earlyaccess/nanumpenscript.css",
    "Nanum Brush Script":  "http://fonts.googleapis.com/earlyaccess/nanumbrushscript.css",
    "Nanum Gothic Coding": "http://fonts.googleapis.com/earlyaccess/nanumgothiccoding.css",
    "Jeju Gothic":         "http://fonts.googleapis.com/earlyaccess/jejugothic.css",
    "Jeju Myeongjo":       "http://fonts.googleapis.com/earlyaccess/jejumyeongjo.css",
    "Jeju Hallasan":       "http://fonts.googleapis.com/earlyaccess/jejuhallasan.css",
    "KoPub Batang":        "http://fonts.googleapis.com/earlyaccess/kopubbatang.css",
    "Noto Sans KR":        "http://fonts.googleapis.com/earlyaccess/notosanskr.css",
    "Hanna":               "http://fonts.googleapis.com/earlyaccess/hanna.css",
*/

PM.CONFIG.FONT_DEFAULT = "Nanum Gothic";
PM.CONFIG.FONT_POOL = [
    "BM Dohyeon",
    "BM Hanna",
    "BM Jua",
    "Jeju Gothic",
    "Jeju Myeongjo",
    "Jeju Hallasan",
    "KoPub Batang",
    "Nanum Barun Gothic",
    "Nanum Barun Gothic Light",
    "Nanum Barun Pen",
    "Nanum Gothic",
    "Nanum Myeongjo",
    "Nanum Pen Script",
    "Nanum Brush Script",
    "Nanum Square",
    "Noto Sans KR",
    "Seoul Hangang",
    "Seoul Namsan",

    "TDc Ballerina",
    "TDc Bearnrabbit",
    "TDc Bigeyes",
    "TDc Childheart",
    "TDc Donkiprince",
    "TDc Donkiround",
    "TDc Pororomc",
    "TDc Poundingheart",
    "TDc Todayweather",
    "TDc Valentine",

    // 캘린터 폰트
    "Avenir LT Std 35 Light",
    "OratorStd Medium",
    "ITCAvantGardeStd-XLtCn",
    "Times New Roman"

    /*
    // 한글문자에 영문전용글꼴이 선택된 경우, 기본글꼴로 교체. (추가/제거시 이곳만 처리하면 됨)
    "Autoradiographic",
    "Bebas",
    "ChubGothic",
    "Exmouth",
    "JennaSue",
    "LiberationSerif",
    "Lobster",
    "Multicolore",
    "OstrichSans",
    "Philosopher",
    "RoundsBlack",
    "RussoOne",
    "ScriptinaPro",
    "TTCoralsThinDEMO"
    */
];
/*
// 한글문자에 영문전용글꼴이 선택된 경우, 기본글꼴로 교체. (추가/제거시 이곳만 처리하면 됨)
PM.CONFIG.FONT_ENG = [
    "Autoradiographic",
    "Bebas",
    "ChubGothic",
    "Exmouth",
    "JennaSue",
    "LiberationSerif",
    "Lobster",
    "Multicolore",
    "OstrichSans",
    "Philosopher",
    "RoundsBlack",
    "RussoOne",
    "ScriptinaPro",
    "TTCoralsThinDEMO"
];
*/

//PM.CONFIG.FONT_CACHED = [];
PM.CONFIG.FONT_PATH = {
    "BM Dohyeon":          "./webfont/kor/bmdohyeon.css",
    "BM Hanna":            "./webfont/kor/bmhanna.css",
    "BM Jua":              "./webfont/kor/bmjua.css",
    "Jeju Gothic":         "./webfont/kor/jejugothic.css",
    "Jeju Myeongjo":       "./webfont/kor/jejumyeongjo.css",
    "Jeju Hallasan":       "./webfont/kor/jejuhallasan.css",
    "KoPub Batang":        "./webfont/kor/kopubbatang.css",
    "Nanum Barun Gothic":  "./webfont/kor/nanumbarungothic.css",
    "Nanum Barun Gothic Light": "./webfont/kor/nanumbarungothic-light.css",
    "Nanum Barun Pen":     "./webfont/kor/nanumbarunpen.css",
    "Nanum Gothic":        "./webfont/kor/nanumgothic.css",
    "Nanum Myeongjo":      "./webfont/kor/nanummyeongjo.css",
    "Nanum Pen Script":    "./webfont/kor/nanumsonpen.css",
    "Nanum Brush Script":  "./webfont/kor/nanumsonbrush.css",
    "Nanum Square":        "./webfont/kor/nanumsquare.css",
    "Noto Sans KR":        "./webfont/kor/notosanskr.css",
    "Seoul Hangang":       "./webfont/kor/seoulhangang.css",
    "Seoul Namsan":        "./webfont/kor/seoulnamsan.css",

    "TDc Ballerina":       "./webfont/kor/tdc_ballerina.css",
    "TDc Bearnrabbit":     "./webfont/kor/tdc_bearnrabbit.css",
    "TDc Bigeyes":         "./webfont/kor/tdc_bigeyes.css",
    "TDc Childheart":      "./webfont/kor/tdc_childheart.css",
    "TDc Donkiprince":     "./webfont/kor/tdc_donkiprince.css",
    "TDc Donkiround":      "./webfont/kor/tdc_donkiround.css",
    "TDc Pororomc":        "./webfont/kor/tdc_pororomc.css",
    "TDc Poundingheart":   "./webfont/kor/tdc_poundingheart.css",
    "TDc Todayweather":    "./webfont/kor/tdc_todayweather.css",
    "TDc Valentine":       "./webfont/kor/tdc_valentine.css",

    // 캘린더 폰트
    "Avenir LT Std 35 Light": "./webfont/eng/AvenirLT35Light.css",
    "OratorStd Medium":       "./webfont/eng/OratorStd.css",
    "ITCAvantGardeStd-XLtCn": "./webfont/eng/ITCAvantGardeStd.css",
    "Times New Roman":        "./webfont/eng/TimesNewRoman.css"

    /*
    // 한글문자에 영문전용글꼴이 선택된 경우, 기본글꼴로 교체. (추가/제거시 이곳만 처리하면 됨)
    "Autoradiographic":    "./webfont/eng/AutoradiographicRg.css",
    "Bebas":               "./webfont/eng/Bebas.css",
    "ChubGothic":          "./webfont/eng/ChubGothic.css",
    "Exmouth":             "./webfont/eng/Exmouth.css",
    "JennaSue":            "./webfont/eng/JennaSue.css",
    "LiberationSerif":     "./webfont/eng/LiberationSerif.css",
    "Lobster":             "./webfont/eng/Lobster.css",
    "Multicolore":         "./webfont/eng/Multicolore.css",
    "OstrichSans":         "./webfont/eng/OstrichSans.css",
    "Philosopher":         "./webfont/eng/Philosopher.css",
    "RoundsBlack":         "./webfont/eng/RoundsBlack.css",
    "RussoOne":            "./webfont/eng/RussoOne.css",
    "ScriptinaPro":        "./webfont/eng/ScriptinaPro.css",
    "TTCoralsThinDEMO":    "./webfont/eng/TTCoralsThinDEMO.css"
    */
};

//
PM.COLOR_PAGE_BORDER = "rgba(0, 255, 0, 0.5)";
PM.COLOR_PAGE_FOCUS_STROKE = "rgba(0, 255, 255, 0.5)";
PM.COLOR_LAYER_STROKE = "rgba(0,0,0,0.5)";
PM.COLOR_LAYER_FILL   = "rgba(0,0,0,0.1)";
PM.COLOR_TBOX_WARNING_FILL = "rgba(255,255,0,0.5)";
PM.COLOR_DRAGGER_FOCUS_STROKE  = "rgba(255,0,0,1.0)";
PM.COLOR_DRAGGER_FOCUS_FILL    = "rgba(255,100,100,0.6)";
PM.COLOR_DRAGGER_NORMAL_STROKE = "rgba(0,0,0,0.5)";
PM.COLOR_DRAGGER_NORMAL_FILL   = "rgba(80,190,240,0.6)";

PM.TBOX_COMMENT_DEFAULT = "내용을 입력해 주십시오"; // 바꾸지 말것.

