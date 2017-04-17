//  bizwork 2017.0125 ///////

BZ.ChangeJson.PageParse = function(xml_data, is_change_layout) {
    var page = this;

 

        // 1. 캘린더의 레이아웃 변경은 레이어를 전부 삭제하지 않는다. is_change_layout..
        //    사진틀과 글상자만 교체하며, 스티커와 날짜셀(글상자), 배경 스킨은 유지한다.
  
            page.layer_array = [];

            // 2. 캘린더는 테마xml에 스킨정보가 없고 page's layout xml에만 있으므로 이곳에서 스킨정보를 얻어야 함.
            //    단, 포토북은 테마xml에서 스킨정보가 없었으면 여기서 다시 시도하지 말것. page's layout xml의 skin_link는 사용하면 안된다. 2016.11.28. (이재봉차장 확인)
            var $filename = $(xml_data).find("foreground").find("file");
            var skin_link = $filename.text();
            if (skin_link.length > 0) {
                page.skin_link = PM.Util.GetFullPathName(PM.URL.SKIN_FILE, skin_link);
            }
       
  // page color
    var $color = $(xml_data).find("pagefileargb");
    if ($color && $color.attr("r") && $color.attr("g") && $color.attr("b")) {
        page.color = PM.Util.ToHexColor($color.attr("r"), $color.attr("g"), $color.attr("b"));
    }
    else {
        page.color = "";
    }
    // page size
    var $rect = $(xml_data).find("pageinfo");

    page.width = parseInt($rect.attr("width"));
    page.height =parseInt($rect.attr("height"));

 
    // image layers
    var $image_layers = $(xml_data).find("layer").find("maskimage")
	

    $image_layers.each(function(idx) {
        console.log("   imagelayer: " + idx);
        var layer = new PM.Core.ImageLayer;
   
        page.AddLayerOrderly(layer);

        layer.type = 0;
        layer.Parse($(this));

    });

     // text layers
    $(xml_data).find("text").each(function(idx) {
        //console.log("   textlayer: " + idx);
        var layer = new PM.Core.TextLayer;
        //page.layer_array.push(layer);
        page.AddLayerOrderly(layer);
       //console.log(layer);
        layer.type = 2;
        layer.Parse($(this));
    });

    $(xml_data).find("layer").find("image").each(function(idx) {
       // console.log("iconlayer: " + idx);
        var layer = new PM.Core.IconLayer;
        //page.layer_array.push(layer);
		
        page.AddLayerOrderly(layer);
        //console.log(layer);
        layer.type = 4;

        layer.Parse($(this));
    });
}


PM.Core.Page.prototype.Parse =BZ.ChangeJson.PageParse;



///////////////////////////////////////// page.js ///////////////////////////////////////////////////////////////////


///////////////////////////////////////// layer.js ///////////////////////////////////////////////////////////////////

BZ.ChangeJson.LayerParse = function($item) {
    var that = this;
	


    that.gid        = $item.attr("gid");
    that.require    = ($item.attr("require") === "true");
    that.movelock   = ($item.attr("movelock") === "true");
    that.resizelock = ($item.attr("resizelock") === "true");
    that.zorderlock = ($item.attr("zorderlock") === "true");
    that.removelock = ($item.attr("removelock") === "true");

    $layer_rect = $item.find("location");
    that.xpos   = parseFloat($layer_rect.attr("x"));
    that.ypos   = parseFloat($layer_rect.attr("y"));
    that.width  = parseFloat($layer_rect.attr("w"));
    that.height = parseFloat($layer_rect.attr("h"));

    // 좌표 검증.
    if (that.gid != "spine" && (that.xpos+that.width) < 0) {
        console.error("outbound layer !!");
        that.xpos = 0;
    }
    // 회전정보 정규화.
    var angle = parseFloat($layer_rect.attr("angle"));
    if (isNaN(angle)) angle = 0;
    if (angle < 0) angle += 360;
    if (angle > 360) angle -= 360;

    // 책등을 제외하고, 레이어의 XML의 좌상단 좌표는 회전정보에 따라 다르다.
    // 따라서, 회전정보를 참고하여 좌상단 좌표를 내부에서 사용 가능한 형태로 정규화해야 한다.
    if (that.gid != "spine" && angle != 0) {

        // XML상의 정보는 좌상단을 기준으로 회전함.
        // 따라서, 회전 이후의 중심점을 구하고 중심점을 기준으로 xpos와 ypos를 새로 구해야 한다.

        // 반대로 내부 레이어 좌표를 XML상의 좌표로 변환하는 것은 Inner2XmlCoordinate 참고.

        // 1. 중심점은 좌상단이 기준.
        var cx = that.xpos;
        var cy = that.ypos;
        var rad = PM.Util.ToRadian(angle);

        // 2. 4개의 점을 좌상단 기준으로 회전.
        var points = [];
        points.push(that.GetRotatePoint(rad, cx, cy, that.xpos, that.ypos));
        points.push(that.GetRotatePoint(rad, cx, cy, that.xpos+that.width, that.ypos));
        points.push(that.GetRotatePoint(rad, cx, cy, that.xpos, that.ypos+that.height));
        points.push(that.GetRotatePoint(rad, cx, cy, that.xpos+that.width, that.ypos+that.height));

        // 3. 회전 이후의 새로운 중심점을 구한다.
        var rect = that.Points2OutRect(points);
        var new_center_x = rect.l + rect.w/2.0;
        var new_center_y = rect.t + rect.h/2.0;

        // 4. reset xpos & ypos
        that.xpos = new_center_x - that.width/2;
        that.ypos = new_center_y - that.height/2;

        that.radian = rad;
    }
    else {
        that.radian = PM.Util.ToRadian(angle);
    }

    if (that.radian < 0) that.radian += Math.PI*2;
    if (that.radian > Math.PI*2) that.radian -= Math.PI*2;

    // 책등은 모두 금지. 그 외는 모두 허용 (2016.7.19 - 이재봉차장의견적용)
    // 캘린더는 "default" 속성이 존재함. 책등과 동일한 룰적용. (2016.12.5)
    // that.movelock = that.resizelock = that.zorderlock = that.removelock = (that.gid == "spine");
    if (that.gid == "spine" || that.gid == "default") {
        that.movelock = that.resizelock = that.zorderlock = that.removelock = true;
    }
    else {
        that.movelock = that.resizelock = that.zorderlock = that.removelock = false;
    }
}


PM.Core.Layer.prototype.Parse = BZ.ChangeJson.LayerParse;



BZ.ChangeJson.LayerSaveJson = function() {  //text location position
  

    var ret_json = '\n';
    ret_json += ('        "gid": "' + this.gid + '"');
    ret_json += (', "require": ' + this.require);
    ret_json += (', "movelock": ' + this.movelock);
    ret_json += (', "resizelock": ' + this.resizelock);
    ret_json += (', "zorderlock": ' + this.zorderlock);
    ret_json += (', "removelock": ' + this.removelock);
	
    ret_json += (', "x": ' + this.xpos);
    ret_json += (', "y": ' + this.ypos);
    ret_json += (', "w": ' + this.width);
    ret_json += (', "h": ' + this.height);
    ret_json += (', "r": ' + this.radian);


    return ret_json;
}
PM.Core.Layer.prototype.SaveJson = BZ.ChangeJson.LayerSaveJson;  //PM.Core.Layer.js 674


///////////////////////////////////////// layer.js end ////////////////////////////////////////////////////////////////


///////////////////////////////////////// layer.js end ////////////////////////////////////////////////////////////////



BZ.ChangeJson.LayerLoadJson = function(data) {
    this.gid = data.gid;
    this.require = data.require;
    this.movelock = data.movelock;
    this.resizelock = data.resizelock;
    this.zorderlock = data.zorderlock;
    this.removelock = data.removelock;

    this.xpos = data.x;
    this.ypos = data.y;
    this.width = data.w;
    this.height = data.h;
    this.radian = data.r;
	
	
	
	
    return true;
}


PM.Core.Layer.prototype.LoadJson =BZ.ChangeJson.LayerLoadJson; 


















///////////////////////////////////////// Textlayer.js start ////////////////////////////////////////////////////////////////
BZ.ChangeJson.TextLayerParse = function($item) {
    PM.Core.Layer.prototype.Parse.call(this, $item);

    this.halign = $item.find("setup").attr("align"); // left, center, right, justify(xml에 추가필요)

    //this.valign = $item.attr("valign"); // top, middle, bottom.
    this.caption_data= $item.find("description").text();
    this.textdata_data = $item.find("description").text();
	
	
	this.caption  = decodeURIComponent(this.caption_data);
    this.textdata = decodeURIComponent(this.textdata_data);
/*
    if (this.caption.length > 0) console.log("caption: " + this.caption);
    if (this.textdata.length > 0) console.log("textdata: " + this.textdata);

    if (this.textdata.indexOf('\r\n') >= 0) console.log("window1 enter ok.");
    if (this.textdata.indexOf('\n\r') >= 0) console.log("window2 enter ok.");
    if (this.textdata.indexOf('\r') >= 0) console.log("rrr enter ok.");
    if (this.textdata.indexOf('\n') >= 0) console.log("nnn enter ok.");
*/
    // 2016.8.18 이재봉차장 확인 ........................................................................

    // html5 편집기는
    // caption은 글상자가 비어있을 경우에만 보여지는 가이드 문구이고,
    // textdata는 실제 글상자에 들어갈 글내용으로 정의한다.

    // 그러나, 기존 편집기는..
    // xml의 caption값을 무시하고 text값만을 사용한다.
    // '내용을 입력해 주십시오' 문자열과 일치하면 caption으로 인지하고, 그 외의 경우는 text로 인지한다.
    // 그래서 졸업테마의 1P문구가 실제 데이터로 잘 인식되는 것이다.

    // 그래서 나는..
    if (this.textdata.length > 0) {
        if (this.textdata.indexOf(PM.TBOX_COMMENT_DEFAULT) >= 0) {
            this.caption = this.textdata;            // case 1. textdata가 '내용을 입력해 주십시오'인 경우,
            this.textdata = "";
        }
        else {
            this.caption = PM.TBOX_COMMENT_DEFAULT;  // case 2. textdata가 실제 적용해야 할 문구인 경우,
            this.textdata;
        }
    }
    else {
        this.caption = PM.TBOX_COMMENT_DEFAULT;      // case 3. textdata가 비어있는 경우,
        this.textdata = "";
    }
    // .............................................................................................

    $layer_font = $item.find("setup"); //레이어  텍스트 속성 관련.

    var fontname = $layer_font.attr("name");
	console.log(fontname);
    // if (PM.Util.IsFontCalendarOnly(fontname)) {  캘린더 영문폰트가 선택되지 않도록.. 이곳에서 필터링한다.
        // fontname = PM.CONFIG.FONT_DEFAULT;
    // }

    fontname = PM.Util.GetWebFont(fontname);
    PM.Util.LoadWebFont(fontname, function() {
        console.log("[load-xml] webfont loaded... " + fontname + " " + Date.now());
    });
    this.fontname = fontname;

    // x : xml_value = 6 : 8
    // x = (xml_value * 6) / 8
    this.fontsize = parseInt($layer_font.attr("size")); // 포인트단위 : XML단위 = 6 : 8
    this.fontsize = Math.floor((this.fontsize * 6) / 8);
    this.italic = ($layer_font.attr("italic") === "true");
    this.bold = ($layer_font.attr("bold") === "true");
    this.color = $layer_font.attr("color");
	
	console.log(this.color);
/*
    this.bkcolor = PM.Util.String2HexColor($layer_font.attr("bkcolor")); // 무시
    this.chargap = parseFloat($layer_font.attr("chargap")); // 무시
    this.linegap = parseFloat($layer_font.attr("linegap")); // 무시
    this.bkcolor = "";
    this.chargap = 0;
    this.linegap = 0;
*/
}


PM.Core.TextLayer.prototype.Parse =BZ.ChangeJson.TextLayerParse;

BZ.ChangeJson.TextLayerSaveJson = function() {
    // 글상자를 편집 중일 때는 DDX가 안될 수도 있으므로..
    this.textdata = this.tbox.toString();

    var ret_json = '\n        {';
    ret_json += PM.Core.Layer.prototype.SaveJson.call(this);

    ret_json += ('\n        , "type": ' + PM.TYPE.TEXT);


        //ret_json += ('\n        , "valign": "' + this.tbox.getvalign() + '"');
        ret_json += ('\n        , "caption": "' + this.caption + '"');
        ret_json += ('\n        , "description": "' + this.textdata + '"');
        ret_json += ('\n        , "name": "' + this.fontname + '"');
        ret_json += ('\n        , "size": ' + this.fontsize);
        ret_json += ('\n        , "italic": ' + this.italic);
        ret_json += ('\n        , "bold": ' + this.bold);
        ret_json += ('\n        , "color": "' + this.color + '"');
        ret_json += ('\n        , "align": "' + this.halign + '"');

        ret_json += ('\n        , "tbox_info": \n');
        ret_json += this.tbox.SaveJsonEx();
   

    ret_json += '\n        }';
    //console.log(ret_json);
    return ret_json;
}


PM.Core.TextLayer.prototype.SaveJson =BZ.ChangeJson.TextLayerSaveJson;

///////////////////////////////////////// Textlayer.js end ////////////////////////////////////////////////////////////////






///////////////////////////////////////// ImageLayerParse.js start ////////////////////////////////////////////////////////////////




BZ.ChangeJson.ImageLayerParse = function($item) {
    PM.Core.Layer.prototype.Parse.call(this, $item);

    $layer_effect = $item.find("effect");

    var filename = $layer_effect.attr("diagramfilename");
    if (filename && filename.length > 0) {
        this.diagram = PM.Util.GetFullPathName(PM.URL.STICKER_FILE, filename);
    }
    else {
        filename = $layer_effect.attr("rotateflip");
        if (filename && filename == "roundmask") {
            this.diagram = PM.CONFIG.ROUNDMASK_IMAGE;
        }
    }

    if (this.gid == "polaroidimage") {
        $frame = $item.find("frame");

        filename = $frame.attr("filename");
        if (filename && filename.length > 0) {
            this.special = PM.Util.GetFullPathName(PM.URL.STICKER_FILE, filename);
        }
    }
    else if (this.gid == "diagramimage") {
        $frame = $item.find("frame");

        filename = $frame.attr("filename");
        if (filename && filename.length > 0) {
            this.diagram = PM.Util.GetFullPathName(PM.URL.STICKER_FILE, filename);
        }
    }
}



PM.Core.ImageLayer.prototype.Parse =BZ.ChangeJson.ImageLayerParse;

///////////////////////////////////////// ImageLayerParse.js start ////////////////////////////////////////////////////////////////

BZ.ChangeJson.ImageLayerSaveJason = function() {
    //console.log(">> save original image size: " + this.original_w + " x " + this.original_h);
    var ret_json = '\n        {';
    ret_json += PM.Core.Layer.prototype.SaveJson.call(this);
    ret_json += ('\n        , "type": ' + PM.TYPE.IMAGE);
    ret_json += ('\n        , "diagram": "' + this.diagram + '"');

    // 폴라로이드일때만 special을 저장한다.
    // 기존 사진틀에 덧대는 이미지(ex:아기/곰돌이)의 경우에는 diagram filename으로 부터 찾을 수 있도록 special이름을 비워놔야 한다.
    if (this.IsPolaroid()) {
        ret_json += ('\n        , "special": "' + this.special + '"');

        // save only. 합성단을 위해 정보 저장.
        var special_rect = this.CalcPolaroidRect();
        ret_json += ('\n        , "special_x": ' + special_rect.x);
        ret_json += ('\n        , "special_y": ' + special_rect.y);
        ret_json += ('\n        , "special_w": ' + special_rect.w);
        ret_json += ('\n        , "special_h": ' + special_rect.h);
    }

    ret_json += ('\n        , "photo_org": "' + this.photo_org + '"');
    ret_json += ('\n        , "original_w": ' + this.original_w);
    ret_json += ('\n        , "original_h": ' + this.original_h);

    ret_json += ('\n        , "photo": "' + this.photo + '"');
    ret_json += ('\n        , "photo_angle": ' + this.photo_angle);
    ret_json += ('\n        , "photo_width": ' + (this.photo_image ? this.photo_image.width : 0));   // 저장시에만 기록
    ret_json += ('\n        , "photo_height": ' + (this.photo_image ? this.photo_image.height : 0)); // 저장시에만 기록
    ret_json += ('\n        , "flip_x": ' + this.flip_x);
    ret_json += ('\n        , "flip_y": ' + this.flip_y);
    ret_json += ('\n        , "crop_x": ' + this.crop_x);
    ret_json += ('\n        , "crop_y": ' + this.crop_y);
    ret_json += ('\n        , "crop_w": ' + this.crop_w);
    ret_json += ('\n        , "crop_h": ' + this.crop_h);
    ret_json += '\n        }';
console.log("Json file OK");
    return ret_json;
}

PM.Core.ImageLayer.prototype.SaveJson  =BZ.ChangeJson.ImageLayerSaveJason;

///////////////////////////////////////// imagelayer.js start ////////////////////////////////////////////////////////////////


///////////////////////////////////////// ProductBase.js start ////////////////////////////////////////////////////////////////


// BZ.ProductBase = function(){




    // this.card_idx = "";        
    // this.orderno = "";       //
    // this.workSize = "";        // 
    // this.color = "";             // 
    // this.jsondata = "";      // 
    // this.pageCnt = "";       //  
    // this.direction = "";     // 
    // this.p_form = "";      //
    // this.sourcemode = "";     // 


    // this.mode = "";          //
    // this.basketno = "";         //
    // this.saveidx ="";      //



	
	
	
	
// }
// PM.Core.ProductCalendar.prototype = new BZ.ProductBase;

///////////////////////////////////////// ProductBase.js start ////////////////////////////////////////////////////////////////
































































BZ.Page=function(){
	 var that =this
that.name ="BZ"
console.log(that.name)	
	
	
}



BZ.BizSelectTheProductType =function(){ 
var page =new BZ.Page();

 var that =this

that.name ="bizname"
console.log(that.name)

}
BZ.BizSelectTheProductType.prototype.abc =function(){ 

console.log("protot123")
}

var abcq = new BZ.BizSelectTheProductType;

abcq.abc() //ghcnf

var a="3"
var b="6"
var c=""

$.when(a, b,c).then(
     function(){
	 console.log("$.when_test")
	 });	 
	 

	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 

;(function (window, Constructor, undefined) {

	// Constructor
	var BizStart = function(){
		    that = this;
		
		
	};


	BizStart.prototype = {
		init : function() {
                
	
				that.preset.tiger();  //함수
				
				
				console.log(that);
				
				
				
				
				
				
				var canvas_biz = {
					 delPage : function() {
						alert("tre");
					  }


					}; 

				Constructor.canvas_biz = canvas_biz;

		
				
			
			

	
		}
		,preset :{
			
				tiger :function(){
					
					console.log("tiger");
					
				}
		
			
		}
	};

	Constructor.Biz = BizStart;
	
	
	  BizStart();

})(window, BizPrint);
	
var Biz_data = new BizPrint.Biz() // 객체필요
Biz_data.__proto__.init(); //초기 로드해야함


//BizPrint.canvas_biz.delPage(); 


	 
	 
	 
	 
	 
	 
	 

// PM.Core.Layer.prototype.SaveJson = function() {
    // var ret_json = '\n';
    // ret_json += ('        "gid": "' + this.gid + '"');
    // ret_json += (', "require": ' + this.require);
    // ret_json += (', "movelock": ' + this.movelock);
    // ret_json += (', "resizelock": ' + this.resizelock);
    // ret_json += (', "zorderlock": ' + this.zorderlock);
    // ret_json += (', "removelock": ' + this.removelock);

    // ret_json += (', "xs": ' + this.xpos);
    // ret_json += (', "ys": ' + this.ypos);
    // ret_json += (', "th": ' + this.width);
    // ret_json += (', "height": ' + this.height);
    // ret_json += (', "radian": ' + this.radian);

    // var out_rect = this.GetOutRect();
    // ret_json += (', "out_x": ' + out_rect.l);
    // ret_json += (', "out_y": ' + out_rect.t);
    // ret_json += (', "out_w": ' + out_rect.w);
    // ret_json += (', "out_h": ' + out_rect.h);

    // return ret_json;
// }
	 
	 
	 
	 
	 
	 // Editor
BZ.Framework.edit = new function() {
    var that = this;

    var is_modified = false;
    var is_macintosh = false;
    var shift_state = false;
    var ready_state = PM.CONFIG.BOOT_LOADING;
    var photomon_title = "";

    var message_bar = new PM.Ctrl.Message;
    var debug_bar = null;

    var canvas = null;
    var context = null;
    var product = null;
    var pair_num = 0;
    var scale_factor = 1.0;
    var preview_mode = false;
    var grid_mode = false;
    var grid_space = PM.CONFIG.GRID_SPACE;
    var grid_color = PM.CONFIG.GRID_COLOR;

    var thumb_array = [];
    
    var undo_stack = [];
    var redo_stack = [];

    var barcode_image = null;
    var page_gradation_image = null;
    var photo_empty_image = null;
    var photo_warning_image = null;

    var loadCompleteCallback = null;
    var addPhotosCompleteCallback = null;
    var selectLayerCallback = null;
    var moveLayerCallback = null;
    var updateTextStateCallback = null;
    var updateTextBoundsCallback = null;
    var updateProgressCallback = null;

    this.Init = function(infos) {
        /* 포토북/캘린더 개별 로드때 각각 실행할 것. LoadWebFont를 연속으로 호출하면 문제 발생 소지가 있음.
        PM.Util.LoadWebFont(PM.CONFIG.FONT_DEFAULT, function() {
            console.log("[default] webfont loaded... " + PM.CONFIG.FONT_DEFAULT + " " + Date.now());
        });
        */

        photomon_title = document.title;
        document.title = photomon_title + "." + PM.Core.Version;

        PM.Core.MAIN_CANVAS_ID = infos.canvasTarget.id;

        canvas = infos.canvasTarget;
        context = canvas.getContext("2d");

        canvas.width = 2000;
        canvas.height = 2000;

        canvas.ondragover = this.OnDragOver;
        canvas.ondrop = this.OnDrop;

        canvas.addEventListener('contextmenu', this.OnContextMenu, false);
        canvas.addEventListener('dblclick', this.OnDoubleClick, false);
        canvas.addEventListener('mousedown', this.OnMouseDown, false);
        canvas.addEventListener('mousemove', this.OnMouseMove, false);
        document.addEventListener('mouseup', this.OnMouseUp, false);
        document.addEventListener('keydown', this.OnKeyDown, false);
        document.addEventListener('keypress', this.OnKeyPress, false);
        document.addEventListener('keyup', this.OnKeyUp, false);
        window.addEventListener('resize', this.OnResize, true);

        document.body.addEventListener('online', this.OnUpdateConnection, false);
        document.body.addEventListener('offline', this.OnUpdateConnection, false);

        // 크롬에서는 minimum font-size issue (7point/10px)가 있기 때문에 비활성화 코드 추가가 필요함.
        /*
            html, body {
                -webkit-text-size-adjust: none
            }
        */
        document.body.style.webkitTextSizeAdjust = "none";

		$(window).on("beforeunload", function() {
            //return "이 페이지를 벗어나면 작성된 내용은 저장되지 않습니다.";
		});

        window.requestAnimationFrame = function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) { window.setTimeout(callback, 1000); }
            //return function (callback) { window.setTimeout(callback, 1000); }
        }();
        window.requestAnimationFrame(this.OnMainLoop);

        //
        // load product
        //
        product = infos.productInfo;
        switch (product.GetType()) {
            case PM.PRODUCT.PHOTOBOOK:
                PM.URL.LAYOUT_FILE = PM.URL.PHOTOBOOK_LAYOUT;
                PM.URL.SKIN_FILE = PM.URL.PHOTOBOOK_SKIN;
                break;
            case PM.PRODUCT.CALENDAR:
                PM.URL.LAYOUT_FILE = PM.URL.CALENDAR_LAYOUT;
                PM.URL.SKIN_FILE = PM.URL.CALENDAR_SKIN;
                break;
            default:
                console.assert(false, "unknown product_type.");
                break;
        }

        // 최초 로딩..
        if (product.product_code.length > 0) {
            product.Load(null);
        }
        this.SetModified(false);

        undo_stack = [];
        redo_stack = [];        

        //
        this.loadCompleteCallback = infos.loadCompleteCallback;
        this.addPhotosCompleteCallback = infos.addPhotosCompleteCallback;
        this.deletePhotosCompleteCallback = infos.deletePhotosCompleteCallback;
        this.updateTextStateCallback = infos.updateTextStateCallback;
        this.selectLayerCallback = infos.selectLayerCallback;
        this.moveLayerCallback = infos.moveLayerCallback;
        this.contextMenuCallback = infos.contextMenuCallback;
        this.movePageCallback = infos.movePageCallback;
        this.dropTargetCallback = infos.dropTargetCallback;
        this.updateTextBoundsCallback = function(w, h) {
            var layer = that.GetSelectedLayer();
            if (layer && layer.GetType() == PM.TYPE.TEXT) {
                that.ResizeFromTBox(layer, w, h);
            }
        }
        this.updateProgressCallback = infos.updateProgressCallback;

        debug_bar = infos.infoTarget;


        //
        // load cover_barcode image
        var barcode_xhr = PM.Util.LoadImage(PM.CONFIG.COVER_BARCODE_IMAGE);
        barcode_xhr.done(function(data) {
            that.barcode_image = data;
        });
        barcode_xhr.fail(function() {
            that.barcode_image = null;
            console.log("* Fail:PM.Editor.Framework.Init: " + PM.CONFIG.COVER_BARCODE_IMAGE);
        });
        // load page_gradation image
        var grad_xhr = PM.Util.LoadImage(PM.CONFIG.PAGE_GRADATION_IMAGE);
        grad_xhr.done(function(data) {
            that.page_gradation_image = data;
        });
        grad_xhr.fail(function() {
            that.page_gradation_image = null;
            console.log("* Fail:PM.Editor.Framework.Init: " + PM.CONFIG.PAGE_GRADATION_IMAGE);
        });
        // load photo_empty image
        var empty_xhr = PM.Util.LoadImage(PM.CONFIG.PHOTO_EMPTY_IMAGE);
        empty_xhr.done(function(data) {
            that.photo_empty_image = data;
        });
        empty_xhr.fail(function() {
            that.photo_empty_image = null;
            console.log("* Fail:PM.Editor.Framework.Init: " + PM.CONFIG.PHOTO_EMPTY_IMAGE);
        });
        // load photo_warning image
        var warning_xhr = PM.Util.LoadImage(PM.CONFIG.PHOTO_WARNING_IMAGE);
        warning_xhr.done(function(data) {
            that.photo_warning_image = data;
        });
        warning_xhr.fail(function() {
            that.photo_warning_image = null;
            console.log("* Fail:PM.Editor.Framework.Init: " + PM.CONFIG.PHOTO_WARNING_IMAGE);
        });
    }

    // inner function :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.Ready = function(state) {
        ready_state = state;
        if (ready_state == PM.CONFIG.BOOT_SUCCESS) { // PM.CONFIG.BOOT_SUCCESS = 1;
            this.RecalcCanvasSize();

            is_macintosh = PM.Util.IsMacintosh();
            //PM.Util.IsLowResolutionTest();
        }
    }
    this.GetDC = function() {
        return context;
    }
    this.IsShiftState = function() {
        return shift_state;
    }
    this.IsMacintosh = function() {
        return is_macintosh;
    }
    this.SetIMEState = function() {
        //canvas.contentEditable = true;
        //canvas.style = "ime-mode:disable;";
        canvas.style.imeMode = "disable";
    }
    this.GetParentElementSize = function() {
        var parent_size = {w:1000, h:600};
        if (canvas.parentElement) {
            if (canvas.parentElement.nodeName.toUpperCase() == "DIV") {
                var bounds = canvas.parentElement.getBoundingClientRect();
                // -= margin, padding ...
                parent_size.w = bounds.width;
                parent_size.h = bounds.height;
            }
        }
        return parent_size;
    }
    this.RecalcCanvasSize = function() {
        if (!product) return;

        // parent size (div)
        var parent_size = PM.Util.P2LSize(this.GetParentElementSize(), scale_factor);

        // product size (product's page pair)
        var pair_size = this.GetPairSize(pair_num);
        var product_size = {w:pair_size.w + PM.CONFIG.CANVAS_MARGIN_W, h:pair_size.h + PM.CONFIG.CANVAS_MARGIN_H};

        // result size (canvas element)
        var result_w = Math.max(product_size.w, parent_size.w);
        var result_h = Math.max(product_size.h, parent_size.h);

        canvas.width = result_w * scale_factor - 20; // parent div에서 스크롤바 크기때문에 스크롤바 생기는 케이스 방지..
        canvas.height = result_h * scale_factor - 20;
    }
    this.ResizeFromTBox = function(layer, w, h) {
        if (product) {
            if (!product.dragger.IsResize()) {
                layer.ResizeFromTBoxCallback(w, h); // tbox내부에서 크기변동이 필요할때만 호출. 직접 리사이징할때는 호출하지 말것.
            }
            product.ResizeFromTBoxCallbackProcess(scale_factor);
            product.CheckBoundary(pair_num);
        }        
    }
    this.CheckBoundary = function() {
        if (product) {
            product.CheckBoundary(pair_num);
        }
    }
    this.ShowMessageBar = function(msg) {
        message_bar.Show(msg);
    }
    this.HideMessageBar = function() {
        message_bar.Hide();
    }

    // product operation ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.GetProduct = function() {
        return product;
    }
    this.LoadProduct = function(json_str) {
        var data = null;
        try {
            data = JSON.parse(json_str);
        }
        catch (exception) {
            data = null;
            console.error(exception);
        }
        
        if (data) {
            var new_product = null;
            if (data.base_type == undefined) { // base_type을 정의하기 이전의 포맷은 포토북만 존재함.
                new_product = new PM.Core.ProductPhotobook;
            }
            else if (data.base_type == PM.PRODUCT.PHOTOBOOK) {
                new_product = new PM.Core.ProductPhotobook;
            }
            else if (data.base_type == PM.PRODUCT.CALENDAR) {
                new_product = new PM.Core.ProductCalendar;
            }
            else {
                console.assert(false, "unknown product base_type..");
            }

            product = null;
            product = new_product;
            new_product.LoadJson(data);
            //console.log(product);
            
            this.SetModified(false);
            undo_stack = [];
            redo_stack = [];            
        }
        else {
            PM.Editor.Framework.loadCompleteCallback && PM.Editor.Framework.loadCompleteCallback(-1, "Parse failed");
        }
    }
    this.SaveProduct = function() {
        if (!product) return "";

        this.SetModified(false);
        undo_stack = [];
        redo_stack = [];

        return product.SaveJson(); //return JSON.stringify(product);
    }
    this.ClearProduct = function() {
        product = null;
        pair_num = 0;
        scale_factor = 1.0;
        this.SetModified(false);
    }
    this.LoadTheme = function(theme_depth1, theme_depth2, theme_name) { // photobook only.
        var new_product = new PM.Core.ProductPhotobook;

        new_product.user_id = product.user_id;
        new_product.session_id = product.session_id;
        new_product.add_param = product.add_param;
        new_product.price = product.price;

        new_product.product_code = product.product_code;
        new_product.product_key = product.product_key;
        new_product.product_name = product.product_name;

        new_product.product_size = product.product_size;
        new_product.product_type = product.product_type;
        new_product.cover_type = product.cover_type;
        new_product.surface_type = product.surface_type;

        new_product.theme_depth1 = theme_depth1;
        new_product.theme_depth2 = theme_depth2;
        new_product.theme_name = theme_name;

        new_product.price_page = product.price_page;
        new_product.min_page = product.min_page;
        new_product.max_page = product.max_page;

        var user_image_list = product.GetUserImageListPerPage();

        this.ClearProduct();
        product = new_product;
        product.Load(user_image_list);
        
        this.SetModified(false);
        undo_stack = [];
        redo_stack = [];
    }
    this.IsKeepStickerMode = function() {
        if (product && (product.GetType() == PM.PRODUCT.PHOTOBOOK)) {
            return product.IsKeepStickerMode();
        }
        return true;
    }
    this.SetKeepStickerMode = function(keep_sticker) {
        if (product && (product.GetType() == PM.PRODUCT.PHOTOBOOK)) {
            product.SetKeepStickerMode(keep_sticker);
        }
    }
    this.SetStartYearMonth = function(start_year, start_month, month_count) {
        if (product && (product.GetType() == PM.PRODUCT.CALENDAR)) {
            product.SetStartYearMonth(start_year, start_month, month_count);
            undo_stack = [];
            redo_stack = [];
        }
    }
    this.GetLunarShowMode = function() {
        if (product && (product.GetType() == PM.PRODUCT.CALENDAR)) {
            return product.GetLunarShowMode();
        }
        return true;
    }
    this.SetLunarShowMode = function(is_show) {
        if (product && (product.GetType() == PM.PRODUCT.CALENDAR)) {
            product.SetLunarShowMode(is_show);
        }
    }
    this.GetCalendarProductCode = function() {
        if (product && (product.GetType() == PM.PRODUCT.CALENDAR)) {
            if (product.calendar_data) {
                return product.calendar_data.product_code;
            }
        }
        return null;
    }
    this.SetCalendarProductCode = function(pcode) {
        if (product && (product.GetType() == PM.PRODUCT.CALENDAR)) {
            product.product_code = pcode;
        }
    }

    this.IsComplete = function() {
        if (product) {
            return product.CheckComplete();
        }
        return false;
    }
    this.IsModified = function() {
        return this.is_modified;
    }
    this.SetModified = function(is_dirty) {
        this.is_modified = is_dirty;
        document.title = photomon_title + "." + PM.Core.Version + (this.is_modified ? '*' : '');
    }
    this.SetPreviewMode = function(is_preview_mode) {
        preview_mode = is_preview_mode;
    }
    this.IsPreviewMode = function() {
        return preview_mode;
    }

    this.GetPoolInfo = function() {
        if (product && product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            return product.GetPoolInfo();
        }
        return null;
    }
    this.IsEmptySpine = function() {
        if (product && product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            return product.IsEmptySpine();
        }
        return false;
    }
    this.IsHoleCoverProduct = function() { // 커버와 1P 사진을 공유하는 상품.
        if (product && product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            return product.IsHoleCoverProduct();
        }
        return false;
    }
    this.IsSharedImageType = function(share_layer) {
        if (product && product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            return product.IsSharedImageType(share_layer);
        }
        return false;
    }
    this.SetSharedImageInfo = function(share_layer) {
        if (product && product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            if (product.IsHoleCoverProduct()) {
                product.SetSharedImageInfo(share_layer);
            }
        }
    }

    // thumbnails operation :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.MakePreviewImages = function(is_pair_mode) { // 전송용 썸네일 목록에 사용 (이미지 변환)
        if (!product) return null;

        var result = null;
        var old_mode = preview_mode;
        preview_mode = true;

        try {
            // true: 2페이지씩, false: 1페이지씩
            result = product.MakePreviewImages(is_pair_mode);
        }
        catch (exception) {
            result = null;
            console.error(exception);
        }
        finally {
            preview_mode = false;
            preview_mode = old_mode;
        }
        return result;
    }
    this.ConnectPageThumbnail = function(thumb, pair) { // 하단 페이지 목록에 사용 (캔버스 연동)
        if (!product) return;
        if (!thumb) return;

        thumb_array[pair] = thumb;

        var temp_canvas = thumb;
        var temp_context = thumb.getContext("2d");
        var temp_scale = product.GetFitScaleFactor(temp_canvas.width-5, temp_canvas.height-5);
        if (temp_canvas && temp_context) {
            this.Draw(temp_context, temp_canvas, temp_scale, pair);
        }
    }
    this.SetCurrentThumbnail = function(thumb) { // 페이지 썸네일 목록 처리
        if (!product) return;
        if (ready_state != PM.CONFIG.BOOT_SUCCESS) return;

        // no-op
        this.ModifyCurrentThumbnail(pair_num);
    }
    this.ModifyCurrentThumbnail = function(pair) {
        this.DrawThumbnail(pair);

        if (this.IsHoleCoverProduct()) { // 커버와 1P의 썸네일이 동시에 움직일 수 있도록 처리.
            if (pair == 0) {
                this.DrawThumbnail(1);
            }
            else if (pair == 1) {
                this.DrawThumbnail(0);
            }
        }
    }
    this.DrawThumbnail = function(pair) {
        if (pair < 0 || pair >= thumb_array.length) return;
        if (thumb_array[pair] == null || thumb_array[pair] == undefined) return;

        var thumb_canvas = thumb_array[pair];
        var thumb_context = thumb_canvas.getContext("2d");
        var thumb_scale = product.GetFitScaleFactor(thumb_canvas.width-5, thumb_canvas.height-5);

        this.Draw(thumb_context, thumb_canvas, thumb_scale, pair);
    }

    // pair(page) operation :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.MovePair = function(pair) {
        if (!product) return 0;

        pair_count = product.PairCount();
        if (pair < 0) {
            pair = 0;
        }
        else if (pair >= pair_count) {
            pair = pair_count-1;
        }
        pair_num = pair;

        this.RecalcCanvasSize();

        product.ClearSelect();
        this.Draw(context, canvas, scale_factor, pair_num);

        this.movePageCallback && this.movePageCallback(pair_num);
        return pair_num;
    }
    this.SwapPair = function(pair1, pair2) { // 페이지 스왑 (순서변경: 즉시 변경시 사용)
        // 아직 사용 안함. 언두/리두 추가 후 사용할 것.
        return false;

        if (!product) return false;
        if (preview_mode) return false;

        this.SetModified(true);
        return product.SwapPages(pair1, pair2);
    }
    this.ReorderPair = function(new_array) { // 페이지 재정렬 (순서변경: 한꺼번에 반영시 사용)
        if (!product) return false;
        if (preview_mode) return false;

        this.SetModified(true);
        return product.ReorderPages(pair_num, new_array);
    }
    this.AddPair = function(pos, pair_count) {
        if (!product) return PM.ADDPAGE_FAIL;
        if (preview_mode) return PM.ADDPAGE_FAIL;

        this.SetModified(true);

        if (pos == "current") {
            return product.AddPages(pair_num, parseInt(pair_count));
        }
        else if (pos == "last") {
            return product.AddPages(-1, parseInt(pair_count));
        }
        return PM.ADDPAGE_FAIL;
    }
    this.DeletePair = function(pos, pair_count) {
        if (!product) return PM.DELPAGE_FAIL;
        if (preview_mode) return PM.DELPAGE_FAIL;

        this.SetModified(true);

        var result = PM.DELPAGE_FAIL;
        if (pos == "current") {
            result = product.DeletePages(pair_num, parseInt(pair_count));
        }
        else if (pos == "last") {
            result = product.DeletePages(-1, parseInt(pair_count));
        }

        this.MovePair(pair_num);

        return result;
    }

    // pair(page) helper func :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.GetTotalPageCount = function() {
        if (!product) return 0;
        return product.GetTotalPageCount();
    }
    this.GetInnerPageCount = function() {
        if (!product) return 0;
        return product.GetInnerPageCount();
    }
    this.GetPairText = function(pair) {
        if (!product) return "";
        return product.GetPairText(pair);
    }
    this.GetPairNumber = function() {
        return pair_num;
    }
    this.GetPairCount = function() {
        if (!product) return 0;
        return product.PairCount();
    }
    this.GetPairSize = function(pair) {
        if (!product) return {w:0, h:0}
        return product.GetPairSize(pair);
    }
    this.GetCurrentPairSize = function() {
        if (!product) return {w:0, h:0}
        return product.GetPairSize(pair_num);
    }
    this.GetPageNumber = function(pair) { // 현재 pair의 왼쪽 page number 리턴
        if (!product) return PM.PAGE.ERROR;
        return product.Pair2PageIndex(pair);
    }

    // layer operation ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.CheckEmptyLayers = function() {
        if (!product) return;
        if (preview_mode) return;

        return product.CheckEmptyLayers();
    }
    this.DeleteEmptyLayers = function(pair) {
        if (!product) return;
        if (preview_mode) return;

        product.ClearSelect();

        this.SetModified(true);
        product.DeleteEmptyLayers(pair);
    }
    this.DeleteLayer = function() {
        if (!product) return;
        if (preview_mode) return;

        this.SetModified(true);
        product.DeleteLayer();
    }
    this.RotateLayer = function(angle) {
        if (!product) return false;
        if (preview_mode) return false;

        this.SetModified(true);
        return product.RotateLayer(angle);
    }
    this.UpLayer = function() {
        if (!product) return false;
        if (preview_mode) return false;

        this.SetModified(true);
        return product.UpLayer();
    }
    this.DownLayer = function() {
        if (!product) return false;
        if (preview_mode) return false;

        this.SetModified(true);
        return product.DownLayer();
    }

    // layer photos :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.AddPhotos = function(photos) {
        if (!product) return;
        if (preview_mode) return;

        this.SetModified(true);
        product.AddPhotos(photos);
    }
    this.DeletePhotos = function() {
        if (!product) return;
        if (preview_mode) return;

        this.SetModified(true);
        product.DeletePhotos();
    }
    this.GetUserImageList = function() { // 사용자 사진 목록 (json list)
        if (!product) return "";
        return product.GetUserImageList();
    }
    this.GetUserImageListText = function() { // 사용자 사진 목록 (text string)
        if (!product) return "";

        var result_string = "";

        var json_list = product.GetUserImageList();
        for (var i = 0; i < json_list.length; i++) {
            var json_object = JSON.parse(json_list[i]);

            result_string += json_object.org_link;
            result_string += "\n";
        }
        return result_string;
    }

    // layer helper func ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.GetPageFromIndex = function(index) {
        if (!product) return null;
        if (preview_mode) return null;

        var page = null;
        if (index >= 0) {
            page = product.page_array[index];
        }
        else {
            switch (index) {
                case PM.PAGE.COVER_FRONT:  page = product.cover.front_page; break;
                case PM.PAGE.COVER_MIDDLE: page = product.cover.middle_page; break;
                case PM.PAGE.COVER_BACK:   page = product.cover.back_page; break;
                default: break;
            }
        }
        return page;
    }
    this.SetSelectLayer = function(page_idx, layer_idx, is_popup_toolbar) {
        if (!product) return null;
        if (preview_mode) return null;

        var sel_page = this.GetPageFromIndex(page_idx);
        if (sel_page && layer_idx >= 0 && layer_idx < sel_page.layer_array.length) {
            var sel_layer = sel_page.layer_array[layer_idx];
            if (sel_layer) {
                product.SetSelectLayer(sel_page, sel_layer, is_popup_toolbar);
            }
        }
    }
    this.GetSelectedLayer = function() {
        if (!product) return null;
        if (preview_mode) return null;

        return product.GetSelectedLayer();
    }
    this.GetSelectedLayerIndex = function() {
        if (!product) return null;
        if (preview_mode) return null;

        var sel_page = this.GetSelectedPage();
        if (sel_page) {
            var sel_layer = product.GetSelectedLayer();
            return sel_page.GetLayerIndex(sel_layer);
        }
        return -1;
    }
    this.GetSelectedPage = function() {
        if (!product) return null;
        if (preview_mode) return null;

        return product.GetSelectedPage();
    }    
    this.GetSelectedPageIndex = function() {
        if (!product) return null;
        if (preview_mode) return null;

        return product.GetSelectedPageIndex();
    }
    this.GetEditableTextBox = function() { // 글상자가 셀렉트된 경우.
        if (!product) return null;
        if (preview_mode) return null;

        var layer = product.GetSelectedLayer();
        if (layer && layer.GetType() == PM.TYPE.TEXT) {
            return layer.GetEditableTextBox();
        }
        return null;
    }
    this.IsFocusTextBox = function() { // 글상자에서 편집중인 경우.
        if (!product) return false;
        if (preview_mode) return false;

        var layer = product.GetSelectedLayer();
        if (layer && layer.GetType() == PM.TYPE.TEXT) {
            return layer.IsFocusTextBox();
        }
        return false;
    }

    // canvas view mode :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.FitScale = function() {
        if (!product) return 1.0;

        // fit canvas_size
        var parent_size = this.GetParentElementSize();
        canvas.width = parent_size.w;
        canvas.height = parent_size.h;

        // fit product_size
        scale_factor = product.GetFitScaleFactor(canvas.width-PM.CONFIG.CANVAS_MARGIN_W, canvas.height-PM.CONFIG.CANVAS_MARGIN_H);

        this.Draw(context, canvas, scale_factor, pair_num);
        return scale_factor;
    }
    this.SetScale = function(scale) {
        if (!product) return 1.0;

        if (scale < PM.CONFIG.SCALE_MIN) {
            scale = PM.CONFIG.SCALE_MIN;
        }
        else if (scale > PM.CONFIG.SCALE_MAX) {
            scale = PM.CONFIG.SCALE_MAX;
        }
        scale_factor = scale;

        this.RecalcCanvasSize();

        this.Draw(context, canvas, scale_factor, pair_num);
        return scale;
    }
    this.GetScale = function() {
        return scale_factor;
    }
    this.GetGridMode = function() {
        return grid_mode;
    }
    this.SetGridMode = function(mode) {
        if (preview_mode) return;
        grid_mode = mode;
    }
    this.GetGridOption = function() {
        return {
            space: grid_space,
            color: grid_color
        }
    }
    this.SetGridOption = function(grid_option) {
        grid_space = grid_option.space;
        grid_color = grid_option.color;
    }

    // draw :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.Draw = function(dc, cv, scale, pair) {
        dc.clearRect(0, 0, cv.width, cv.height);

        dc.save();
        dc.scale(scale, scale);

        var size = {
            w: cv.width,
            h: cv.height
        };
        size = PM.Util.P2LSize(size, scale);

        if (product) {
            if (ready_state == PM.CONFIG.BOOT_SUCCESS) {
                product.DrawPair(dc, pair, size.w, size.h);

                if (cv == canvas) {
                    // draw barcode
                    this.DrawBarcode(dc, pair);

                    if (!preview_mode) {
                        // draw guideline
                        this.DrawGuideline(dc, pair);

                        // draw grid
                        if (grid_mode) {
                            this.DrawGrid(dc, pair);
                        }

                        // draw debug_info
                        if (PM.DEBUG) {
                            this.DebugInfo(dc);
                            ///*
                            var layer = product.GetSelectedLayer();
                            if (layer) {
                                var codi = layer.Inner2XmlCoordinate();
                                var codi_str = "> " + codi.x + ", " + codi.y + ", " + codi.w + ", " + codi.h + ", angle:" + codi.angle;

                                dc.save();

                                dc.font = "16px Nanum Gothic";
                                dc.fillStyle = "#ff0000"
                                dc.textAlign = "left";
                                dc.textBaseline = "middle";
                                dc.fillText(codi_str, 10, 30);

                                dc.restore();
                            }
                            //*/
                        } // ....
                    }
                }
            }
        }
        dc.restore();

        // draw boot_msg or message bar (확대/축소 스크롤에 영향을 받지 않도록 디바이스좌표계를 따른다.)
        if (cv == canvas && !preview_mode) {
            if (canvas.parentElement && canvas.parentElement.nodeName.toUpperCase() == "DIV") {
                var x = canvas.parentElement.scrollLeft;
                var y = canvas.parentElement.scrollTop;
                var w = canvas.parentElement.getBoundingClientRect().width;
                var h = PM.CONFIG.MESSAGEBAR_HEIGHT;

                message_bar.Draw(dc, x, y, w, h);
            }

            if (ready_state != PM.CONFIG.BOOT_SUCCESS) {
                var msg = (ready_state == PM.CONFIG.BOOT_FAILURE) ? PM.CONFIG.BOOT_FAILURE_MSG : PM.CONFIG.BOOT_LOADING_MSG;

                var x = canvas.parentElement.scrollLeft;
                var y = canvas.parentElement.scrollTop;
                var rect = canvas.parentElement.getBoundingClientRect();
                this.DrawBootMessage(dc, x, y, rect.width, rect.height, msg);
            }
        }
    }
    this.DrawBarcode = function(dc, pair) {
        if (!product) return;

        dc.save();

        if (product.GetType() == PM.PRODUCT.PHOTOBOOK) {
            var is_cover = (pair <= 0);
            if (is_cover && this.barcode_image) {
                var product_rect = product.GetWorkRect(pair);
                var lx = product_rect.l;
                var ty = product_rect.t;

                var ginfo = PM.Codi.GetPhotobookGuideInfo(pair, product.product_type, product.product_size, product.cover_type, product.surface_type, product.GetInnerPageCount());

                dc.drawImage(this.barcode_image, lx + ginfo.barcode_rect.x, ty + ginfo.barcode_rect.y, ginfo.barcode_rect.w, ginfo.barcode_rect.h);
            }
        }
        else if (product.GetType() == PM.PRODUCT.CALENDAR) {
            var is_epilog = (PM.PAGE.EPILOG == product.Pair2PageIndex(pair));
            if (is_epilog && this.barcode_image) {
                var product_rect = product.GetWorkRect(pair);
                var lx = product_rect.l;
                var ty = product_rect.t;

                var ginfo = product.calendar_data;

                dc.drawImage(this.barcode_image, lx + ginfo.barcode_rect.x, ty + ginfo.barcode_rect.y, ginfo.barcode_rect.w, ginfo.barcode_rect.h);
            }
        }

        dc.restore();
    }
    this.DrawGuideline = function(dc, pair) {
        if (!product) return;

        // 가이드 라인과 문구의 기본 크기를 결정한다.
        var extra_overhang = 32; // line overhang
        var guide_font = "16px Nanum Gothic";
        var guide_font_h = 16; // 16px

        var pair_size = product.GetPairSize(pair);
        if (Math.max(pair_size.w, pair_size.h) < 500) {
            extra_overhang = 24;
            guide_font = "10px Nanum Gothic";
            guide_font_h = 10;
        }
        // .................................

        dc.save();

        var product_rect = product.GetWorkRect(pair);
        var lx = product_rect.l;
        var rx = product_rect.l + product_rect.w;
        var ty = product_rect.t;
        var by = product_rect.t + product_rect.h;
		
		//console.log("lx:"+lx+"rx:"+rx+"ty:"+ty+"by:"+by);

       if (product.GetType() == PM.PRODUCT.CALENDAR) {

            var ginfo = product.calendar_data;
		

            //
            var extra = extra_overhang;
            dc.strokeStyle = PM.CONFIG.GUIDE_COLOR;
            dc.fillStyle = PM.CONFIG.GUIDE_TEXT_COLOR;
            dc.lineWidth = PM.CONFIG.GUIDE_LINEW;

            // 그리기 시작..
            dc.beginPath();

            // 가로 재단선 상
            dc.moveTo(lx - extra, ty + ginfo.cut_info.h);
            dc.lineTo(rx + extra, ty + ginfo.cut_info.h);
			//console.log(lx); //479
			//console.log(rx); //2233
			//console.log(extra); //32
			//console.log(ginfo.cut_info.h);//7
			//console.log(ginfo.cut_info.w);//7
			//console.log(dc);
            // 가로 재단선 하
            dc.moveTo(lx - extra, by - ginfo.cut_info.h);
            dc.lineTo(rx + extra, by -ginfo.cut_info.h);
            // 세로 재단선 좌
            dc.moveTo(lx + ginfo.cut_info.w, ty - extra);
            dc.lineTo(lx + ginfo.cut_info.w, by + extra);
			
			
            // 세로 재단선 우
            dc.moveTo(rx - ginfo.cut_info.w, ty - extra);
            dc.lineTo(rx - ginfo.cut_info.w, by + extra);

            dc.stroke();
			
		var	num_cut_position = BZ.FIRSTJSON.cutpage;
		var	width_cut_position = BZ.FIRSTJSON.cutpagewidth;
		var width_cut_position_array;
		    width_cut_position_array= width_cut_position.split("^");
			
       // console.log(BZ.FIRSTJSON.cutpage);	
 
        //console.log(width_cut_position_array[1]);	

       		//console.log(lx); //479
			//console.log(rx); //2233
			//console.log(extra); //32
			//console.log(ginfo.cut_info.h);//7
			//console.log(ginfo.cut_info.w);//7

	        //
			
		if(asp_mode	== "edit"){
			

			
		
 
						 // 그리기 시작..
					dc.beginPath();
					dc.strokeStyle = "red"
					dc.lineWidth =2;
					dc.setLineDash( [10,15] );
					
					// 가로 재단선 상

					
					// 세로 재단선 좌1
					dc.moveTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA1, ty - extra); 
					dc.lineTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA1, by + extra);  
					
					
					dc.moveTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA2*2, ty - extra);
					dc.lineTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA2*2, by + extra);  


					//console.log(BZ.NEWCUTDATA);
					
				   //console.log((rx-lx)*i/num_cut_position+BZ.NEWCUTDATA);
			
					// 세로 재단선 좌2
					// 세로 재단선 좌2
					// dc.moveTo((rx-lx)*i/num_cut_position + lx, ty - extra);
					// dc.lineTo((rx-lx)*i/num_cut_position + lx, by + extra);
					
					

					dc.stroke();
					
			

		
		
		
		}
    else{
	     if( BZ.MANAGEMODE == true){
			 
			     
			 
			 
			 
					 // 그리기 시작..
					dc.beginPath();
					dc.strokeStyle = "red"
					dc.lineWidth =2;
					dc.setLineDash( [10,15] );
					
					// 가로 재단선 상

					
					// 세로 재단선 좌1
					dc.moveTo(lx + ginfo.cut_info.w+BZ.MANAGERCUTDATA1, ty - extra);
					dc.lineTo(lx + ginfo.cut_info.w+BZ.MANAGERCUTDATA1, by + extra);  
				
						
						
					dc.moveTo(lx + ginfo.cut_info.w+BZ.MANAGERCUTDATA2*2, ty - extra);
					dc.lineTo(lx + ginfo.cut_info.w+BZ.MANAGERCUTDATA2*2, by + extra);  
						
						
						
						
				
					
					
					
					
					
					//console.log(lx + ginfo.cut_info.w);
					//console.log(BZ.NEWCUTDATA);
					
				   //console.log((rx-lx)*i/num_cut_position+BZ.NEWCUTDATA); 				// 세로 재단선 좌2
					// 세로 재단선 좌2
					// dc.moveTo((rx-lx)*i/num_cut_position + lx, ty - extra);
					// dc.lineTo((rx-lx)*i/num_cut_position + lx, by + extra);
					
					

					dc.stroke();
					
					

		 }
            else{
			
		    
						 // 그리기 시작..
					dc.beginPath();
					dc.strokeStyle = "red"
					dc.lineWidth =2;
					dc.setLineDash( [10,15] );
					
					// 가로 재단선 상

					
					// 세로 재단선 좌1
					dc.moveTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA1, ty - extra);
					dc.lineTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA1, by + extra);  
					
					
					dc.moveTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA2*2, ty - extra);
					dc.lineTo(lx + ginfo.cut_info.w+BZ.NEWCUTDATA2*2, by + extra);  

					//console.log(lx + ginfo.cut_info.w);
					//console.log(BZ.NEWCUTDATA);
					
				   //console.log((rx-lx)*i/num_cut_position+BZ.NEWCUTDATA); 				// 세로 재단선 좌2
					// 세로 재단선 좌2
					// dc.moveTo((rx-lx)*i/num_cut_position + lx, ty - extra);
					// dc.lineTo((rx-lx)*i/num_cut_position + lx, by + extra);
					
					

					dc.stroke();
					
				
					
					
				

	}
  }		
			
			
			
			
	
		

		
		
           // 타공 영역 출력.
            // var x = lx + ginfo.punching_info.x;// + ginfo.cut_info.w;
            // var y = ty + ginfo.punching_info.y;// + ginfo.cut_info.h;
            // var w = ginfo.punching_info.w;
            // var h = ginfo.punching_info.h;
            // var step = ginfo.punching_info.step;
            // var r_max = rx - ginfo.cut_info.w;

           // dc.fillStyle = ginfo.punching_info.color;
            // while (x+w < r_max) {
                // dc.fillRect((rx-lx)*1/3 + lx, x, 10, 10);
                // x += (w+step);
            // }   
			// while (x+w < r_max) {
                // dc.fillRect((rx-lx)*2/3 + lx, x, 10, 10);
                // x += (w+step);
            // }

            // 텍스트 출력..
            dc.font = guide_font;
            dc.fillStyle = PM.CONFIG.GUIDE_TEXT_COLOR;

            // 접히는면 좌
            // dc.textAlign = "left";
            // dc.textBaseline = "bottom";
            // dc.fillText("<-잘리는면", lx + ginfo.cut_info.w, ty - PM.CONFIG.GUIDE_TEXT_MARGIN);
            // 접히는면 우
            dc.textAlign = "right";
            dc.textBaseline = "bottom";
            // dc.fillText("잘리는면->", rx - ginfo.cut_info.w, ty - PM.CONFIG.GUIDE_TEXT_MARGIN);

            // 타공 메시지.
            dc.translate(rx+10, ty + ginfo.cut_info.h/2 + ginfo.punching_info.y + ginfo.punching_info.h/2);
            dc.rotate(90*Math.PI/180);
            //dc.translate(-rx, -ty);
            // dc.textAlign = "left";
            // dc.textBaseline = "bottom";
            // dc.fillText("<-타공 위치는 제작시 2mm 이내의 오차가 발생할 수 있습니다.", 0, 0);
        }

        dc.restore();
    }
	
	
	
	
    this.SetCutData = function(data){


		       	switch (data) {								
						case 1:
							BZ.NEWCUTDATA1 =BZ.CUTDATA*10; 
							BZ.NEWCUTDATA2 =BZ.CUTDATA*10;
							 console.log(BZ.CUTDATA);
							break;
							
						case 2:
								BZ.NEWCUTDATA1 =BZ.CUTDATA*10+20;
								BZ.NEWCUTDATA2 =BZ.CUTDATA*10+10;
								console.log(BZ.CUTDATA);
							break;
					
					}
		 

    	  
		  

	}
	
	 this.ManageSetCutData = function(data){


		       	switch (data) {								
						case 1:
							BZ.MANAGERCUTDATA1 =BZ.MANAGERCUTDATA; 
							BZ.MANAGERCUTDATA2 =BZ.MANAGERCUTDATA;
							
						console.log(BZ.MANAGERCUTDATA1);
						     $("#cut_size_info").text("[Size_Left:"+BZ.MANAGERCUTDATA1+"]");// 관리자 모드 loadJsonData+0+
							
							break;
							
						case 2:
							BZ.MANAGERCUTDATA1 =BZ.MANAGERCUTDATA+20;
							BZ.MANAGERCUTDATA2 =BZ.MANAGERCUTDATA+10;
						$("#cut_size_info").text("[Size_Left:"+BZ.MANAGERCUTDATA1+"]");// 관리자 모드
							
							console.log(BZ.MANAGERCUTDATA1);
							break;
					
					}
		 

    	  
		  

	}


    this.DrawGrid = function(dc, pair) {
        dc.save();

        var product_rect = product.GetWorkRect(pair);
        var lx = product_rect.l;
        var rx = product_rect.l + product_rect.w;
        var ty = product_rect.t;
        var by = product_rect.t + product_rect.h;

        var gap = grid_space;
        dc.strokeStyle = grid_color;
        dc.lineWidth = PM.CONFIG.GRID_LINEW;

        dc.beginPath();
        for (var i = lx; i <= rx; i += gap) {
            dc.moveTo(i, ty);
            dc.lineTo(i, by);
        }
        for (var i = ty; i <= by; i += gap) {
            dc.moveTo(lx, i);
            dc.lineTo(rx, i);
        }
		
		
		
        dc.stroke();

        dc.restore();
    }
    this.DrawBootMessage = function(dc, x, y, w, h, msg) {
        dc.save();

        dc.font = PM.CONFIG.BOOT_FONT;
        dc.fillStyle = PM.CONFIG.BOOT_COLOR;
        dc.textAlign = "center";
        dc.textBaseline = "middle";
        dc.fillText(msg, x + w/2, y + h/2);

        dc.restore();
    }

    // debug info :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.DebugString = function() {
        return "";
    }
    this.DebugInfo = function(dc) {
        if (!PM.DEBUG) return "";
        if (!product) return "";
        if (product.GetType() != PM.PRODUCT.PHOTOBOOK) return "";
        
        if (debug_bar) {
            var info_str = "";
            info_str += ("[" + product.product_code);
            info_str += (" " + product.product_size);
            info_str += (" " + product.product_type);
            info_str += (" " + product.cover_type);
            info_str += (" " + product.surface_type);
            info_str += (" " + product.theme_depth1);
            info_str += (" " + product.theme_depth2);
            info_str += ("] ");

            var ginfo = PM.Codi.GetPhotobookGuideInfo(pair_num, product.product_type, product.product_size, product.cover_type, product.surface_type, product.GetInnerPageCount());
            info_str += ("[");
            info_str += (" 책등폭:" + ginfo.middle_w);
            info_str += (" 재단선:" + ginfo.cut_w + " " + ginfo.cut_h);
            //info_str += (" 바코드:" + ginfo.barcode_rect.x + " " + ginfo.barcode_rect.y + " " + ginfo.barcode_rect.w + " " + ginfo.barcode_rect.h);
            info_str += (" ] ");

            debug_bar.html(info_str);
        }
    }

    // change background color/skin, layout :::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.DropDefault = function(target_id, target_value) {
        if (!product) return;
        if (preview_mode) return;

        product.ResetFocus(pair_num);

        product.DropDefault(pair_num, target_id, target_value);

        this.SetModified(true);
    }
    this.ChangeAll = function(target_id, target_value) {
        if (!product) return false;
        if (preview_mode) return false;

        product.ResetFocus(pair_num);
        var result = product.ChangeAll(pair_num, target_id, target_value);
        if (result) {
            this.SetModified(true);
            return true;
        }
        return false;
    }

    // copy cut paste :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.Copy = function() {
        if (!product) return false;
        if (preview_mode) return false;
        if (!this.IsCopyAvailable()) {
            console.log("Copy is not available.");
            return false;
        }

        return product.Copy(pair_num);
    }
    this.Cut = function() {
        if (!product) return false;
        if (preview_mode) return false;
        if (!this.IsCutAvailable()) {
            console.log("Cut is not available.");
            return false;
        }

        this.SetModified(true);
        return product.Cut(pair_num);
    }
    this.Paste = function() {
        if (!product) return false;
        if (preview_mode) return false;
        if (!this.IsPasteAvailable()) {
            console.log("Paste is not available.");
            return false;
        }

        this.SetModified(true);
        return product.Paste(pair_num);
    }
    this.IsCopyAvailable = function() {
        if (!product) return false;
        if (preview_mode) return false;
        if (this.IsFocusTextBox()) return false;

        var layer = product.GetSelectedLayer();
        return (layer && layer.gid != "spine");
    }
    this.IsCutAvailable = function() {
        return this.IsCopyAvailable();
    }
    this.IsPasteAvailable = function() {
        if (!product) return false;
        if (preview_mode) return false;
        if (this.IsFocusTextBox()) return false;

        return (product.clipboard_memory.length > 0);
    }

    // undo redo ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.RecordOperation = function(type, pair_pos, old_info, new_info, desc) {

        //if (!PM.DEBUG) return; // 비상시, 모든 언두/리두 액션을 비활성화하기 위한 코드..

        var op = new PM.Record(type, pair_pos, old_info, new_info, desc);
        if (op != null) {
            redo_stack = [];
            undo_stack.push(op);
            //console.log("Record Operation: " + desc);
        }
    }
    this.DumpRecord = function() {
        if (!PM.DEBUG) return;

        console.log("\n[undo stack...................]");
        for (var i = 0; i < undo_stack.length; i++) {
            console.log(i + ". " + undo_stack[i].desc);
        }
        console.log("\n[redo stack...................]");
        for (var i = 0; i < redo_stack.length; i++) {
            console.log(i + ". " + redo_stack[i].desc);
        }
        console.log("\n");
    }
    this.Undo = function() {
        if (!this.IsUndoAvailable()) {
            console.log("Undo is not available.");
            return;
        }
        var that = this;
        setTimeout(function() {
            var op = undo_stack.pop();
            if (op) {
                product.ResetFocus(pair_num); // for ddx

                op.UndoAction();
                redo_stack.push(op);

                product.ResetFocus(pair_num);
                that.DumpRecord();

                product.ClearSelect();
                PM.Editor.Framework.selectLayerCallback && PM.Editor.Framework.selectLayerCallback(null, null);
            }
        }, 200); // 연속실행방지를 위한 임시코드. 추후, 콜백처리로 교체할 것. (이미지처리와 같이 시간이 걸리는 처리에 오류 발생 가능성이 있어서 추가함.)
    }
    this.Redo = function() {
        if (!this.IsRedoAvailable()) {
            console.log("Redo is not available.");
            return;
        }
        var that = this;
        setTimeout(function() {
            var op = redo_stack.pop();
            if (op) {
                product.ResetFocus(pair_num); // for ddx

                op.RedoAction();
                undo_stack.push(op);

                product.ResetFocus(pair_num);
                that.DumpRecord();

                product.ClearSelect();
                PM.Editor.Framework.selectLayerCallback && PM.Editor.Framework.selectLayerCallback(null, null);
            }
        }, 200); // 연속실행방지를 위한 임시코드. 추후, 콜백처리로 교체할 것. (이미지처리와 같이 시간이 걸리는 처리에 오류 발생 가능성이 있어서 추가함.)
    }
    this.GetUndoStack = function() {
        return undo_stack;
    }
    this.GetUndoDesc = function() {
        if (undo_stack.length > 0) {
            var record_item = undo_stack[undo_stack.length-1];
            if (record_item && record_item.desc) {
                return record_item.desc;
            }
        }
        return "";
    }
    this.GetRedoDesc = function() {
        if (undo_stack.length > 0) {
            var record_item = redo_stack[redo_stack.length-1];
            if (record_item && record_item.desc) {
                return record_item.desc;
            }
        }
        return "";
    }
    this.IsUndoAvailable = function() {
        return (undo_stack.length > 0);
    }
    this.IsRedoAvailable = function() {
        return (redo_stack.length > 0);
    }

    // message handler ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    this.WindowToCanvas = function(e) {
        var e = window.event || e;
        var bounds = canvas.getBoundingClientRect();

        return {
            x: e.clientX - bounds.left * (canvas.width / bounds.width),
            y: e.clientY - bounds.top * (canvas.height / bounds.height)
        };
    }
    this.OnMainLoop = function(e) {
        that.OnIdle();
        window.requestAnimationFrame(that.OnMainLoop);
    }

    var _timer_last_update_time = 0;
    this.OnIdle = function(e) {
        that.Draw(context, canvas, scale_factor, pair_num);

        if (ready_state == PM.CONFIG.BOOT_SUCCESS) {
            var now = +new Date; // (new Date()).getTime();
            if (now - _timer_last_update_time > 1000) {
                that.ModifyCurrentThumbnail(pair_num);
                _timer_last_update_time = now;
            }
        }
    }
    this.OnUpdateConnection = function(e) {
        var msg = navigator.onLine ? PM.CONFIG.MESSAGE_ONLINE : PM.CONFIG.MESSAGE_OFFLINE;
        that.ShowMessageBar(msg);
        //console.log(msg);
    }

    this.OnKeyDown = function(e) {
        if (!product) return;
        if (preview_mode) return;

        if (product.KeyDown(e)) {
            that.SetModified(true);
        }
        else {
            //if (!PM.DEBUG) return; // 모든 언두/리두 액션을 비활성화하기 위한 코드..
            
            shift_state = e.shiftKey;
            var c = (e.which || e.keyCode);
            switch (c) {
                case 90: // z
                    if (e.ctrlKey) {
                        if (e.shiftKey) {
                            that.Redo();
                        }
                        else {
                            that.Undo();
                        }
                    }
                    break;
                case 89: // y
                    if (e.ctrlKey) {
                        that.Redo();
                    }
                    break;
                case 37: // left arrow key
                    if (that.GetSelectedLayer() && !that.IsFocusTextBox()) {
                        product.MoveKeyDown(e, pair_num, -1, 0, scale_factor);
                    }
                    break;
                case 39: // right arrow key
                    if (that.GetSelectedLayer() && !that.IsFocusTextBox()) {
                        product.MoveKeyDown(e, pair_num, 1, 0, scale_factor);
                    }
                    break;
                case 38: // up key
                    if (that.GetSelectedLayer() && !that.IsFocusTextBox()) {
                        product.MoveKeyDown(e, pair_num, 0, -1, scale_factor);
                    }
                    break;
                case 40: // down key
                    if (that.GetSelectedLayer() && !that.IsFocusTextBox()) {
                        product.MoveKeyDown(e, pair_num, 0, 1, scale_factor);
                    }
                    break;
                default: break;
            }
        }
    }
    this.OnKeyPress = function(e) {
        if (!product) return;
        if (preview_mode) return;

        if (product.KeyPress(e)) {
            that.SetModified(true);
        }
    }
    this.OnKeyUp = function(e) {
        shift_state = false;

        var c = (e.which || e.keyCode);
        switch (c) {
            case 37: // left arrow key
            case 39: // right arrow key
            case 38: // up key
            case 40: // down key
                if (product && that.GetSelectedLayer() && !that.IsFocusTextBox()) {
                    that.SetModified(true);
                    product.MoveKeyUp(e, pair_num, scale_factor);
                }
                break;
            default: break;
        }
    }

    this.OnDoubleClick = function(e) {
        if (!product) return;
        if (preview_mode) return;

        product.ResetFocus(pair_num);
        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        product.DblClick(e, context, pair_num, pos.x, pos.y);
        
        // 디버그 정보 활성화 / 비활성화
        if (/*scale_factor == 2.0 && */grid_mode && e.shiftKey) {
            var r = product.GetWorkRect(pair_num);
            if (pos.x < r.l && pos.x > (r.l-20)) {
                PM.DEBUG = !PM.DEBUG;

                var empty_pairnum = PM.Editor.Framework.CheckEmptyLayers();
                console.log("emptyLayer pair_num: " + empty_pairnum);
            }
        }
        //PM.DEBUG = true;
        //that.DumpRecord();
        //console.log(that.GetUndoDesc());
        //console.log(that.GetRedoDesc());
    }
    this.OnMouseDown = function(e) {
        if (!product) return;
        if (preview_mode) return;
        if (e.which == 3) return; // except R-button click

        product.ResetFocus(pair_num);
        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        product.Select(e, context, pair_num, pos.x, pos.y, scale_factor);
    }
    this.OnMouseMove = function(e) {
        if (!product) return;
        if (preview_mode) return;

        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        var result = product.Move(e, context, pair_num, pos.x, pos.y, scale_factor);
        switch (result.hit_type) {
            case PM.HIT.MOVE:       e.target.style.cursor = "move"; break;
            case PM.HIT.RESIZE_T:   e.target.style.cursor = "n-resize"; break;
            case PM.HIT.RESIZE_R:   e.target.style.cursor = "e-resize"; break;
            case PM.HIT.RESIZE_B:   e.target.style.cursor = "s-resize"; break;
            case PM.HIT.RESIZE_L:   e.target.style.cursor = "w-resize"; break;
            case PM.HIT.RESIZE_LT:  e.target.style.cursor = "nw-resize"; break;
            case PM.HIT.RESIZE_RT:  e.target.style.cursor = "ne-resize"; break;
            case PM.HIT.RESIZE_RB:  e.target.style.cursor = "se-resize"; break;
            case PM.HIT.RESIZE_LB:  e.target.style.cursor = "sw-resize"; break;
            case PM.HIT.ROTATE:     e.target.style.cursor = "pointer"; break;
            case PM.HIT.MOVE_CROP:  e.target.style.cursor = "pointer"; break;
            case PM.HIT.EDIT_TEXT:  e.target.style.cursor = "text"; break;
            default: e.target.style.cursor = "default"; break;
        }

        if (result.modified) {
            that.SetModified(true);
        }
    }
    this.OnMouseUp = function(e) {
        if (!product) return;
        if (preview_mode) return;

        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        product.Up(e, context, pair_num, pos.x, pos.y, scale_factor);
        e.target.style.cursor = "default";
    }
    this.OnContextMenu = function(e) {
        if (preview_mode) return;

        e.preventDefault();
        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        product.ContextMenu(e, context, pair_num, pos.x, pos.y, scale_factor);
    }
    this.OnResize = function(e) {
        that.RecalcCanvasSize();
    }

    this.OnDragOver = function(e) {
        if (!product) return;
        if (preview_mode) return;

        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        if (product.DragOver(e, context, pair_num, pos.x, pos.y)) {
            e.preventDefault();
        }
    }
    this.OnDrop = function(e) {
        if (!product) return;
        if (preview_mode) return;

        product.ResetFocus(pair_num);

        var pos = PM.Util.P2LPoint(that.WindowToCanvas(e), scale_factor);
        product.Drop(e, context, pair_num, pos.x, pos.y);

        that.SetModified(true);
		
    }
	this.JsonSetCanvas = function(loding_json,jsonfile,a,b,c,d,e,f,g){ // auto re size data
           var modified_json_data =0
		   
		   
		   
		   
		       console.log(loding_json.cutpage+loding_json.cutpagewidth);// 기본 사이즈 정보 페이지 정보랑 사이즈정보.
		   
		   //1. 상품 정보 json 으로 사이즈 변경하여 저장함

									
			  var canvas_size_data =  loding_json.worksize.split("x");	
			  
			  if(canvas_size_data[0]=="299" ||canvas_size_data[0]=="353"||canvas_size_data[0]=="422"||canvas_size_data[0]=="500"){
			  
			  BZ.TREELAYER =true;
			  
			  
			  } else {
				  
				  BZ.TREELAYER =false;  
				  
				  
			  }
				
			  console.log(canvas_size_data[0]);  // 가로 정보 사이즈
			  console.log(canvas_size_data[1]);  // 세로 정보 사이즈
			  console.log(jsonfile.page_array.length);  // 가로 정보 사이즈
				
			  // BZ.CANVASWIDTH =parseInt(canvas_size_data[0])// 엔지에 바로 적용하려고 만들었으나 변수 갯수가 너무많아서 보류
			   //BZ.CANVASHEIGHT =parseInt(canvas_size_data[1])  
			  
			  	// jsonfile.page_array[0].width = canvas_size_data[0]*10*(parseInt(loding_json.cutpage)+1); // 시존 사이즈에 재다나 갯수를 곱한다
			  	// jsonfile.page_array[0].height = canvas_size_data[1]*10;
				for(var i=0; i<jsonfile.page_array.length; i++){
				
				jsonfile.page_array[i].width = canvas_size_data[0]*10; // 시존 사이즈에 재다나 갯수를 곱한다  페이지 1
			  	jsonfile.page_array[i].height = canvas_size_data[1]*10;
				   jsonfile.page_array[i].skin_type ="page";
				
				}
			    // jsonfile.page_array[1].width = canvas_size_data[0]*10; // 시존 사이즈에 재다나 갯수를 곱한다  페이지 2
			  	// jsonfile.page_array[1].height = canvas_size_data[1]*10; 
			  

		    // 2. 재단 되는 정보와 넓이 계산하여 jsond에 반영해야한다.
			  
	           console.log(loding_json.cutpage+loding_json.cutpagewidth);// 컷 페이지 정보랑 사이즈정보.

		    //3. 변경된 데이터들을 수정하여 json으로 저장하면 된다.
		   
		   	jsonfile.category_code = loding_json.categorycode // 시존 사이즈에 재다나 갯수를 곱한다  페이지 1
			jsonfile.work_size = loding_json.worksize 
		    jsonfile.cutpage = loding_json.cutpage // 시존 사이즈에 재다나 갯수를 곱한다  페이지 1
			jsonfile.cutpagewidth = loding_json.cutpagewidth
			//jsonfile.page_array[0].width = 1000;
		
			// console.log(jsonfile.page_array[0].width);
				
	  
		   
		   
	
		   // json 추가해야할 정보를 수정하여 저장한다
		   
		   // jsonfile.page_array[0].skin_type ="page";
		   // jsonfile.page_array[1].skin_type ="page";
		 
		   
		   
		   
		   
		   
		   
		   
		   
  modified_json_data=JSON.stringify(jsonfile)	// 수정된 json오브젝트 파일을 문자열로 수정하여 리턴한다. 
		   
          
         return modified_json_data;
		 
	}

this.JsonManager = function(jsonfile,a,b){ // auto re size data
           var modified_json =0
		   
		   
		   
		   
		       console.log(jsonfile.cutpage+jsonfile.cutpagewidth);// 기본 사이즈 정보 페이지 정보랑 사이즈정보.
		   
		   //1. 상품 정보 json 으로 사이즈 변경하여 저장함

									
			  var canvas_size_data =  jsonfile.work_size.split("x");	
			  
			  if(canvas_size_data[0]=="299" ||canvas_size_data[0]=="353"||canvas_size_data[0]=="422"||canvas_size_data[0]=="500"){
			  
			  BZ.TREELAYER =true;
			  
			  
			  } else {
				  
				  BZ.TREELAYER =false;  
				  
				  
			  }
				
			  console.log(canvas_size_data[0]);  // 가로 정보 사이즈
			  console.log(canvas_size_data[1]);  // 세로 정보 사이즈
			  console.log(jsonfile.page_array.length);  // 가로 정보 사이즈
				
			  // BZ.CANVASWIDTH =parseInt(canvas_size_data[0])// 엔지에 바로 적용하려고 만들었으나 변수 갯수가 너무많아서 보류
			   //BZ.CANVASHEIGHT =parseInt(canvas_size_data[1])  
			  
			  	// jsonfile.page_array[0].width = canvas_size_data[0]*10*(parseInt(loding_json.cutpage)+1); // 시존 사이즈에 재다나 갯수를 곱한다
			  	// jsonfile.page_array[0].height = canvas_size_data[1]*10;
				for(var i=0; i<jsonfile.page_array.length; i++){
				
				jsonfile.page_array[i].width = canvas_size_data[0]*10; // 시존 사이즈에 재다나 갯수를 곱한다  페이지 1
			  	jsonfile.page_array[i].height = canvas_size_data[1]*10;
				   jsonfile.page_array[i].skin_type ="page";
				
				}
			    // jsonfile.page_array[1].width = canvas_size_data[0]*10; // 시존 사이즈에 재다나 갯수를 곱한다  페이지 2
			  	// jsonfile.page_array[1].height = canvas_size_data[1]*10; 
			  

		    // 2. 재단 되는 정보와 넓이 계산하여 jsond에 반영해야한다.
			  
	          console.log(jsonfile.cutpage+jsonfile.cutpagewidth);// 기본 사이즈 정보 페이지 정보랑 사이즈정보.
		   

		    //3. 변경된 데이터들을 수정하여 json으로 저장하면 된다.
		   
		   
		   
			//jsonfile.page_array[0].width = 1000;
		
			// console.log(jsonfile.page_array[0].width);
				
	  
		   
		   
	
		   // json 추가해야할 정보를 수정하여 저장한다
		   
		   // jsonfile.page_array[0].skin_type ="page";
		   // jsonfile.page_array[1].skin_type ="page";
		 
		   
		   
		   
		   
		   
		   
		   
		   
  modified_json_data=JSON.stringify(jsonfile)	// 수정된 json오브젝트 파일을 문자열로 수정하여 리턴한다. 
		   
          
         return modified_json;
		 
	}

	
	
};

	 
PM.Editor.Framework = BZ.Framework.edit;



// $(document).ready(function(){
	
          // var isCtrl = false;
		  
		  
		  // $(document).keyup(function (e) {  //shift +r
          // if(e.which == 16) isCtrl=false;
          // }).keydown(function (e) {
              // if(e.which == 16) isCtrl=true;
              // if(e.which == 82 && isCtrl == true) {
                  // alert('Keyboard shortcuts + JQuery are even more cool!');
              // return false;
           // }
          // });
// });

/*
 * API List

 Init(infos)

 GetProduct
 LoadProduct(json_str)
 SaveProduct
 ClearProduct
 LoadTheme

 GetPoolInfo
 IsEmptySpine

 IsComplete
 IsModified
 SetModified
 SetPreviewMode
 IsPreviewMode

 MakePreviewImages(is_pair_mode)
 ConnectPageThumbnail(thumb, pair)
 SetCurrentThumbnail(thumb)

 GetInnerPageCount
 GetPairNumber

 MovePair(pair)
 SwapPair(pair1, pair2)
 ReorderPair(new_array)
 AddPair(pos, pair_count)
 DeletePair(pos, pair_count)

 DeleteEmptyLayers(pair)
 DeleteLayer
 RotateLayer(angle)
 UpLayer
 DownLayer

 AddPhotos(photos)
 DeletePhotos
 GetUserImageList
 GetUserImageListText

 GetSelectedLayer
 GetEditableTextBox

 FitScale
 SetScale
 GetScale
 GetGridMode
 SetGridMode(mode)
 GetGridOption
 SetGridOption({grid_space, grid_color})

 DropDefault(target_id, target_value)
 ChangeAll(target_id, target_value)

 Copy
 Cut
 Paste
 IsCopyAvailable
 IsCutAvailable
 IsPasteAvailable

 Undo
 Redo
 GetUndoDesc
 GetRedoDesc
 IsUndoAvailable
 IsRedoAvailable

 */

	 
		 

	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 



