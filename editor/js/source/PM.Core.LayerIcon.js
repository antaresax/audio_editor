//
PM.Core.IconLayer = function() {
    PM.Core.Layer.call(this);

    this.alpha = 255;
    this.icon = "";
    this.icon_image = null;
};
//PM.Core.IconLayer.prototype = PM.Core.Layer.prototype;
PM.Core.IconLayer.prototype = new PM.Core.Layer;

PM.Core.IconLayer.prototype.GetType = function() {
    return PM.TYPE.ICON;
}

PM.Core.IconLayer.prototype.GetDesc = function() {
    return "스티커";
}
/*
PM.Core.IconLayer.prototype.Copy = function() {
    var layer = new PM.Core.IconLayer;
    this.CopyProperty(layer);

    layer.alpha = this.alpha;
    layer.icon = this.icon;
    layer.icon_image = null;
    //layer.icon_image = this.icon_image; // 붙여넣을 때, Load함수를 통하므로 Image객체 복사는 필요없다.

    return layer;
}
*/
PM.Core.IconLayer.prototype.Load = function() {
    var deferred = $.Deferred();

    var that = this;

    var icon_url = that.icon;
    //var icon_url = that.icon + ("?check=" + Date.now());
    var image_xhr = PM.Util.LoadImage(icon_url);

    image_xhr.done(function(data) {
        that.icon_image = data;

        // xml을 통해 Load되는 경우가 아니면 width/height를 초기화 해줄 필요가 있다.
        if (that.width <= 0 || that.height <= 0) {
            that.width = that.icon_image.width;
            that.height = that.icon_image.height;
        }
        deferred.resolve();
    });
    image_xhr.fail(function() {
        console.log("* Fail:PM.Core.IconLayer.Load: " + icon_url);
        deferred.reject();
    });

    return deferred.promise();
}

PM.Core.IconLayer.prototype.Draw = function(dc, x, y, order_num) {
//return;
    this.PrepareDC(dc, x, y);

    if (this.icon_image != null) {
        dc.globalAlpha = this.alpha / 255;
        dc.drawImage(this.icon_image, 0, 0, this.width, this.height);
        dc.globalAlpha = 1.0;
    }

    this.DrawExtra(dc, order_num);

    this.ReleaseDC(dc);

/*  out rect test
    var r = this.GetOutRect();
    PM.Util.DrawRect(dc, x + r.l, y + r.t, r.w, r.h, 0.5, PM.COLOR_LAYER_STROKE, PM.COLOR_LAYER_FILL);*/
};

PM.Core.IconLayer.prototype.GetDrawItemList = function() {
    return "\n[icon] " + this.icon;
}

PM.Core.IconLayer.prototype.HitTest = function(dc, x, y) {
    if (PM.Core.Layer.prototype.HitTest.call(this, dc, x, y)) {
        return this;
    }
    return null;
}

PM.Core.IconLayer.prototype.SetAlpha = function(old_alpha, new_alpha, is_record) {
    
    //var old_alpha = this.alpha;
    this.alpha = new_alpha;
    
    if (is_record) {
        var pair_num = PM.Editor.Framework.GetPairNumber();
        var page_idx = PM.Editor.Framework.GetSelectedPageIndex();
        var layer_idx = PM.Editor.Framework.GetSelectedLayerIndex();

        PM.Editor.Framework.RecordOperation(PM.RECORD_ICON_OPACITY, pair_num, { // ............... record undo info
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: old_alpha                            
        }, {
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: new_alpha
        }, "스티커 투명도");        
    }
}

PM.Core.IconLayer.prototype.GetAlpha = function() {
    return this.alpha;
}

PM.Core.IconLayer.prototype.Parse = function($item) {
    PM.Core.Layer.prototype.Parse.call(this, $item);
    this.alpha = parseInt($item.attr("alpha"));
    if (isNaN(this.alpha)) this.alpha = 255;
    //console.log("icon alpha: " + this.alpha);

    $layer_file = $item.find("file");

    var filename = $layer_file.text();
    if (filename && filename.length > 0) {
        this.icon = PM.Util.GetFullPathName(PM.URL.STICKER_FILE, filename);
    }
}

PM.Core.IconLayer.prototype.LoadJson = function(data) {
    var deferred = $.Deferred();
    PM.Core.Layer.prototype.LoadJson.call(this, data);

    this.alpha = data.alpha;
    this.icon = data.icon;

    var that = this;
    var icon_xhr = this.Load();
    icon_xhr.done(function() {
        deferred.resolve();
    });
    icon_xhr.fail(function() {
        console.log("* Fail:PM.Core.IconLayer.LoadJson: " + that.icon);
        deferred.reject();
    });

    return deferred.promise();
}

PM.Core.IconLayer.prototype.SaveJson = function() {
    var ret_json = '\n        {';
    ret_json += PM.Core.Layer.prototype.SaveJson.call(this);
    ret_json += ('\n        , "type": ' + PM.TYPE.ICON);
    ret_json += ('\n        , "alpha": ' + this.alpha);
    ret_json += ('\n        , "icon": "' + this.icon + '"');
    ret_json += '\n        }';
    return ret_json;
}
