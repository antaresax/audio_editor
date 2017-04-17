console.log("webFont.js - Start");

webFont_Load("TDc Ballerina", "../webfont/kor/tdc_ballerina.css");
webFont_Load("TDc Bearnrabbit", "../webfont/kor/tdc_bearnrabbit.css");
webFont_Load("TDc Bigeyes", "../webfont/kor/tdc_bigeyes.css");
webFont_Load("TDc Childheart", "../webfont/kor/tdc_childheart.css");
webFont_Load("TDc Donkiprince", "../webfont/kor/tdc_donkiprince.css");
webFont_Load("TDc Donkiround", "../webfont/kor/tdc_donkiround.css");
webFont_Load("TDc Pororomc", "../webfont/kor/tdc_pororomc.css");
webFont_Load("TDc Poundingheart", "../webfont/kor/tdc_poundingheart.css");
webFont_Load("TDc Todayweather", "../webfont/kor/tdc_todayweather.css");
webFont_Load("TDc Valentine", "../webfont/kor/tdc_valentine.css");


webFont_Load("BM Dohyeon", "../webfont/kor/bmdohyeon.css");
webFont_Load("BM Hanna", "../webfont/kor/bmhanna.css");
webFont_Load("BM Jua", "../webfont/kor/bmjua.css");
webFont_Load("Jeju Gothic", "../webfont/kor/jejugothic.css");
webFont_Load("Jeju Myeongjo", "../webfont/kor/jejumyeongjo.css");
webFont_Load("Jeju Hallasan", "../webfont/kor/jejuhallasan.css");
webFont_Load("KoPub Batang", "../webfont/kor/kopubbatang.css");
webFont_Load("Nanum Barun Gothic", "../webfont/kor/nanumbarungothic.css");
webFont_Load("Nanum Barun Gothic Light", "../webfont/kor/nanumbarungothic-light.css");
webFont_Load("Nanum Barun Pen", "../webfont/kor/nanumbarunpen.css");
webFont_Load("Nanum Gothic", "../webfont/kor/nanumgothic.css");
webFont_Load("Nanum Myeongjo", "../webfont/kor/nanummyeongjo.css");
webFont_Load("Nanum Pen Script", "../webfont/kor/nanumsonpen.css");
webFont_Load("Nanum Brush Script", "../webfont/kor/nanumsonbrush.css");
webFont_Load("Nanum Square", "../webfont/kor/nanumsquare.css");
webFont_Load("Noto Sans KR", "../webfont/kor/notosanskr.css");
webFont_Load("Seoul Hangang", "../webfont/kor/seoulhangang.css");
webFont_Load("Seoul Namsan", "../webfont/kor/seoulnamsan.css");

console.log("webFont.js - End");



function webFont_Load(font_name, font_url) { 

	WebFont.load({
		custom: {
			families: [font_name],
			urls: [font_url]
		},
		loading: function() {
			//console.log("additional webfont loading : " + font_name);
		},
		active: function() {
			//console.log("additional webfont active : " + font_name);
		}
	});
		
}		