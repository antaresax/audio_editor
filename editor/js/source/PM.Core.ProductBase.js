PM.Core.ProductBase = function() {

    this.base_type = PM.PRODUCT.UNKNOWN;

    // 편집기 전달 파라미터 ................................................................................
    this.user_id = "";          // UserId
    this.session_id = "";       // ExistCover (세션값만 사용, "Y^50026835546^N")
    this.add_param = "";        // AddParam
    this.price = 0;             // ProductPrice (상품가격)
    this.basket_name = "";      // BasketName (보관함 이름)
    this.order_code = "";       // ProductId (주문서내 생산코드 - 년월일12자리 + 랜덤3자리 + 제작코드(6자리))

    this.product_code = "";     // ProductCode (상품코드, ex:246201, intnum/seqnum)
    this.product_key = "";      // ProductOption1 (상품고유값, ex:8x8_newdesign_soft)
    this.product_name = "";     // ProductName (상품/사이즈정보, ex:8x8UV)

    // 테마xml로부터 생성된 페이지 ...........................................................................
    this.cover = null;          // 커버페이지 (포토북은 3개 페이지로 구성, 캘린더는 back_page 1개로 구성)
    this.prolog = null;         // 프롤로그페이지
    this.page_array = [];       // 내지배열
    this.epilog = null;         // 에필로그페이지

    this.is_complete = false;   // Edited (편집완료 여부)

    // 기타 내부 전용 변수 ................................................................................
    this.dragger = null;
    this.work_pos = {x:0, y:0};
    this.clipboard_memory = "";
    this.keep_photos = null;
    this.move_state = null; // layer's state for undo/redo
}

// 초기화..
PM.Core.ProductBase.prototype.GetType = function() {
    return this.base_type;
}
PM.Core.ProductBase.prototype.PreProcess = function(that) {
    console.assert(false, "PreProcess");
}
PM.Core.ProductBase.prototype.Load = function(keep_photos) {
    console.assert(false, "Load");
}

// 사진..
PM.Core.ProductBase.prototype.AddPhotosPerPage = function(photos) {
    var promises = [];

    if (this.cover && this.cover.back_page) {
        if (!PM.Editor.Framework.IsHoleLeatherCoverProduct()) { // 커버에 넣지 않고 1P 사진을 공유.
            var next = 0;
            var ret = this.cover.back_page.AddPhotos(photos[0], next);
            promises.push(ret.promise);

            if (this.cover.middle_page) {
                var next = 0;
                var ret = this.cover.middle_page.AddPhotos(photos[1], next);
                promises.push(ret.promise);
            }

            if (this.cover.front_page) {
                var next = 0;
                var ret = this.cover.front_page.AddPhotos(photos[2], next);
                promises.push(ret.promise);
            }
        }
    }
    if (this.prolog) {
        // no-op..
    }
    if (this.page_array.length > 0) {
        var idx = 3;
        for (var i = 0; i < this.page_array.length; i++) {
            var next = 0;
            var ret = this.page_array[i].AddPhotos(photos[idx++], next);
            promises.push(ret.promise);

            if (idx >= photos.length) break;
        }
    }
    if (this.epilog) {
        // no-op..
    }

    var that = this;
    $.when.apply($, promises).then (
        function() { // succeed
            that.AddPhotosComplete();
            that.keep_photos = null;
        },
        function() { // fail
            that.AddPhotosFailure();
        }
    );
}
PM.Core.ProductBase.prototype.ConcatArrayAndAddInfo = function(total_array, add_array, page_idx) {
    if (add_array.length <= 0) return total_array;

    for (var i = 0; i < add_array.length; i++) {
        add_array[i].page_pos = page_idx;
    }
    return total_array.concat(add_array);
}
PM.Core.ProductBase.prototype.AddPhotos = function(photos) {
    var next = 0;
    var result_photos = [];
    var promises = [];

    if (this.cover && this.cover.back_page) {
        if (!PM.Editor.Framework.IsHoleLeatherCoverProduct()) { // 커버에 넣지 않고 1P 사진을 공유.
            var ret = this.cover.back_page.AddPhotos(photos, next);
            next = ret.next_idx;
            promises.push(ret.promise);
            result_photos = this.ConcatArrayAndAddInfo(result_photos, ret.result_photos, PM.PAGE.COVER_BACK);

            if (next >= 0 && this.cover.middle_page) {
                var ret = this.cover.middle_page.AddPhotos(photos, next);
                next = ret.next_idx;
                promises.push(ret.promise);
                result_photos = this.ConcatArrayAndAddInfo(result_photos, ret.result_photos, PM.PAGE.COVER_MIDDLE);
            }

            if (next >= 0 && this.cover.front_page) {
                var ret = this.cover.front_page.AddPhotos(photos, next);
                next = ret.next_idx;
                promises.push(ret.promise);
                result_photos = this.ConcatArrayAndAddInfo(result_photos, ret.result_photos, PM.PAGE.COVER_FRONT);
            }
        }
    }
    if (next >= 0 && this.prolog) {
        var ret = this.prolog.AddPhotos(photos, next);
        next = ret.next_idx;
        promises.push(ret.promise);
        result_photos = this.ConcatArrayAndAddInfo(result_photos, ret.result_photos, PM.PAGE.PROLOG);
    }
    if (next >= 0 && this.page_array.length > 0) {
        for (var i = 0; i < this.page_array.length; i++) {
            var ret = this.page_array[i].AddPhotos(photos, next);
            next = ret.next_idx;
            promises.push(ret.promise);
            result_photos = this.ConcatArrayAndAddInfo(result_photos, ret.result_photos, i);

            if (next < 0) break;
        }
    }
    if (next >= 0 && this.epilog) {
        // no-op..
    }

    if (result_photos.length > 0) {
        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_PHOTO_ADDALL, pair_num, null, { // ......... record undo info
            page_pos: -1,
            layer_pos: -1,
            data: result_photos
        }, "일괄사진넣기");
    }

    var that = this;
    $.when.apply($, promises).then (
        function() { // succeed
            that.AddPhotosComplete();
            that.keep_photos = null;
        },
        function() { // fail
            that.AddPhotosFailure();
        }
    );
}
PM.Core.ProductBase.prototype.AddPhotosComplete = function() {
    console.log("AddPhotos Complete.................................................");
    PM.Editor.Framework.addPhotosCompleteCallback && PM.Editor.Framework.addPhotosCompleteCallback(0, "success");
}
PM.Core.ProductBase.prototype.AddPhotosFailure = function() {
    console.log("AddPhotos Failure..................................................");
    PM.Editor.Framework.addPhotosCompleteCallback && PM.Editor.Framework.addPhotosCompleteCallback(-1, "failure");
}
PM.Core.ProductBase.prototype.DeletePhotos = function() {
    var result_photos = [];

    if (this.cover && this.cover.back_page) {
        var ret = this.cover.back_page.DeletePhotos();
        result_photos = this.ConcatArrayAndAddInfo(result_photos, ret, PM.PAGE.COVER_BACK);

        if (this.cover.middle_page) {
            var ret = this.cover.middle_page.DeletePhotos();
            result_photos = this.ConcatArrayAndAddInfo(result_photos, ret, PM.PAGE.COVER_MIDDLE);
        }
        if (this.cover.front_page) {
            var ret = this.cover.front_page.DeletePhotos();
            result_photos = this.ConcatArrayAndAddInfo(result_photos, ret, PM.PAGE.COVER_FRONT);
        }
    }
    if (this.prolog) {
        var ret = this.prolog.DeletePhotos();
        result_photos = this.ConcatArrayAndAddInfo(result_photos, ret, PM.PAGE.PROLOG);
    }
    if (this.page_array.length > 0) {
        for (var i = 0; i < this.page_array.length; i++) {
            var ret = this.page_array[i].DeletePhotos();
            result_photos = this.ConcatArrayAndAddInfo(result_photos, ret, i);
        }
    }
    if (this.epilog) {
        // no-op..
    }

    if (result_photos.length > 0) {
        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_PHOTO_DELALL, pair_num, { // ............... record undo info
            page_pos: -1,
            layer_pos: -1,
            data: result_photos
        }, null, "일괄사진제거");
    }

    PM.Editor.Framework.deletePhotosCompleteCallback && PM.Editor.Framework.deletePhotosCompleteCallback(0, "");
}
PM.Core.ProductBase.prototype.GetUserImageList = function() {
    var user_image_list = [];

    if (this.cover) {
        var list1 = this.cover.back_page ? this.cover.back_page.GetUserImageList() : [];
        var list2 = this.cover.middle_page ? this.cover.middle_page.GetUserImageList() : [];
        var list3 = this.cover.front_page ? this.cover.front_page.GetUserImageList() : [];
        user_image_list = user_image_list.concat(list1, list2, list3);
    }

    if (this.prolog) {
        // 프롤로그는 사진 없음.
    }

    for (var i = 0; i < this.page_array.length; i++) {
        user_image_list = user_image_list.concat(this.page_array[i].GetUserImageList());
    }

    return user_image_list;
}
PM.Core.ProductBase.prototype.GetUserImageListPerPage = function() {
    var user_image_list = [];

    if (this.cover) {
        user_image_list[0] = this.cover.back_page ? this.cover.back_page.GetUserImageList() : [];
        user_image_list[1] = this.cover.middle_page ? this.cover.middle_page.GetUserImageList() : [];
        user_image_list[2] = this.cover.front_page ? this.cover.front_page.GetUserImageList() : [];
    }

    if (this.prolog) {
        // 프롤로그는 사진 없음.
    }

    var idx = 3;
    for (var i = 0; i < this.page_array.length; i++) {
        user_image_list[idx++] = this.page_array[i].GetUserImageList();
    }

    return user_image_list;
}

// 레이어..
PM.Core.ProductBase.prototype.DeleteEmptyLayers = function(pair_num) {
    var result_array = [];
    var temp_array = [];

    if (pair_num >= 0) {
        var idx = this.Pair2PageIndex(pair_num);
        if (idx > PM.PAGE.ERROR) {
            switch (idx) {
                case PM.PAGE.COVER: {
                    if (this.cover && this.cover.back_page) {
                        if (!PM.Editor.Framework.IsHoleLeatherCoverProduct()) { // 구멍 뚫린 커버는 빈사진레이어를 삭제할 수 없음.
                            temp_array = this.cover.back_page.RemoveEmptyLayers();
                            result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_BACK);
                            if (this.cover.middle_page) {
                                temp_array = this.cover.middle_page.RemoveEmptyLayers();
                                result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_MIDDLE);
                            }
                            if (this.cover.front_page) {
                                temp_array = this.cover.front_page.RemoveEmptyLayers();
                                result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_FRONT);
                            }
                        }
                    }
                    break;
                }
                case PM.PAGE.PROLOG: {
                    temp_array = this.page_array[0].RemoveEmptyLayers();
                    result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, 0);
                    break;
                }
                default: {
                    temp_array = this.page_array[idx].RemoveEmptyLayers();
                    result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, idx);

                    if (this.PageCountInPair() > 1 && this.page_array[idx+1]) {
                        temp_array = this.page_array[idx+1].RemoveEmptyLayers();
                        result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, idx+1);
                    }
                }
            }
        }
    }
    else {
        if (this.cover && this.cover.back_page) {
            if (!PM.Editor.Framework.IsHoleLeatherCoverProduct()) { // 구멍 뚫린 커버는 빈사진레이어를 삭제할 수 없음.
                temp_array = this.cover.back_page.RemoveEmptyLayers();
                result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_BACK);
                if (this.cover.middle_page) {
                    temp_array = this.cover.middle_page.RemoveEmptyLayers();
                    result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_MIDDLE);
                }
                if (this.cover.front_page) {
                    temp_array = this.cover.front_page.RemoveEmptyLayers();
                    result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, PM.PAGE.COVER_FRONT);
                }
            }
        }
        for (var i = 0; i < this.page_array.length; i++) {
            temp_array = this.page_array[i].RemoveEmptyLayers();
            result_array = this.ConcatArrayAndAddInfo(result_array, temp_array, i);
        }
    }

    if (result_array.length > 0) {
        pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_EMPTYLAYERS_DELETE, pair_num, { // . record undo info
            page_pos: -1,
            layer_pos: -1,
            data: result_array
        }, null, "빈레이어 삭제(" + result_array.length + ")");

        PM.Editor.Framework.addPhotosCompleteCallback && PM.Editor.Framework.addPhotosCompleteCallback(0, "success"); // 임시로..
    }
}
PM.Core.ProductBase.prototype.DeleteLayer = function() {

    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();
    var page_idx = this.GetPageIndex(sel_page);
    var layer_idx = sel_page.GetLayerIndex(sel_layer);

    var old_array = [];
    var new_array = [];

    var record_type = PM.RECORD_LAYER_DELETE;
    var old_info = {
        type: sel_layer.GetType(),
        value: $.extend(true, {}, sel_layer) // deep copy
    };
    old_array.push(old_info);

    if (this.dragger.DeleteLayer()) {

        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(record_type, pair_num, { // ........ record undo info
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: old_array
        }, {
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: new_array
        }, sel_layer.GetDesc() + " 삭제");
    }
}
PM.Core.ProductBase.prototype.RotateLayer = function(angle) {

    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();
    var page_idx = this.GetPageIndex(sel_page);
    var layer_idx = sel_page.GetLayerIndex(sel_layer);
    var move_info = sel_layer.GetMoveInfo();

    if (this.dragger.RotateLayer(angle)) {

        PM.Editor.Framework.CheckBoundary();

        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_LAYER_MOVE, pair_num, { // ................. record undo info
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: move_info
        }, {
            page_pos: page_idx,
            layer_pos: layer_idx,
            data: sel_layer.GetMoveInfo()
        }, "레이어 90도 단위 회전");

        return true;
    }
    return false;
}
PM.Core.ProductBase.prototype.UpLayer = function() {

    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();
    var page_idx = this.GetPageIndex(sel_page);
    var old_layer_idx = sel_page.GetLayerIndex(sel_layer);

    var new_layer_idx = this.dragger.UpLayer();
    if (new_layer_idx >= 0) {

        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_LAYER_ZORDER, pair_num, { // ............... record undo info
            page_pos: page_idx,
            layer_pos: old_layer_idx,
            data: null
        }, {
            page_pos: page_idx,
            layer_pos: new_layer_idx,
            data: null
        }, "레이어 앞으로 이동");

        return true;
    }
    return false;
}
PM.Core.ProductBase.prototype.DownLayer = function() {

    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();
    var page_idx = this.GetPageIndex(sel_page);
    var old_layer_idx = sel_page.GetLayerIndex(sel_layer);

    var new_layer_idx = this.dragger.DownLayer();
    if (new_layer_idx >= 0) {

        var pair_num = PM.Editor.Framework.GetPairNumber();
        PM.Editor.Framework.RecordOperation(PM.RECORD_LAYER_ZORDER, pair_num, { // ............... record undo info
            page_pos: page_idx,
            layer_pos: old_layer_idx,
            data: null
        }, {
            page_pos: page_idx,
            layer_pos: new_layer_idx,
            data: null
        }, "레이어 뒤로 이동");

        return true;
    }
    return false;
}
PM.Core.ProductBase.prototype.Copy = function(pair_num) {
    var layer = this.dragger.GetSelectedLayer();
    if (!layer) return false;

    if (layer.gid == "spine") {
        PM.Editor.Framework.ShowMessageBar("복사할 수 없습니다.");
        return false;
    }
/*
    if (layer.GetType() == PM.TYPE.TEXT) {
        this.clipboard_memory = layer.CopyJson();
    }
    else {
        this.clipboard_memory = layer.SaveJson();
    }
*/
    this.clipboard_memory = layer.SaveJson();
    return (this.clipboard_memory.length > 0);
}
PM.Core.ProductBase.prototype.Cut = function(pair_num) {
    var layer = this.dragger.GetSelectedLayer();
    if (!layer) return false;

    //this.clipboard_memory = layer.Copy();
    this.clipboard_memory = layer.SaveJson();
    this.DeleteLayer();
    return (this.clipboard_memory.length > 0);
}
PM.Core.ProductBase.prototype.Paste = function(pair_num) {
    if (this.clipboard_memory.length <= 0) return false;

    var idx = this.Pair2PageIndex(pair_num);
    if (idx <= PM.PAGE.ERROR) return false;

    var page = this.dragger.GetSelectedPage();
    if (!page || page == this.prolog || (this.cover && page == this.cover.middle_page)) {
        switch (idx) {
            case PM.PAGE.COVER: page = this.cover.back_page; break;
            case PM.PAGE.PROLOG: page = this.page_array[0]; break;
            default: page = this.page_array[idx]; break;
        }
    }

    if (page && !page.IsLayerLock()) {
        var new_layer = null;
        var data = JSON.parse(this.clipboard_memory);
        switch (data.type) {
            case PM.TYPE.ICON:  new_layer = new PM.Core.IconLayer; break;
            case PM.TYPE.IMAGE: new_layer = new PM.Core.ImageLayer; break;
            case PM.TYPE.TEXT:  new_layer = new PM.Core.TextLayer; break;
            default: break;
        }
        if (new_layer) {
            new_layer.LoadJson(data);
            new_layer.movelock = new_layer.resizelock = new_layer.zorderlock = new_layer.removelock = false;

            //var x = page.work_pos.x + page.width/2;
            //var y = page.work_pos.y + page.height/2;
            var x = page.work_pos.x + new_layer.xpos + new_layer.width/2 + 20;
            var y = page.work_pos.y + new_layer.ypos + new_layer.height/2 + 20;

            var that = this;
            var result_xhr = page.AddNewLayer(x, y, new_layer, true);
            result_xhr.done(function() {

                that.SetSelectLayer(page, new_layer);
                PM.Editor.Framework.CheckBoundary();

                var old_array = [];
                var new_array = [];
                var page_idx = that.GetPageIndex(page);
                var layer_idx = page.GetLayerIndex(new_layer);
                var new_info = {
                    type: new_layer.GetType(),
                    value: $.extend(true, {}, new_layer) // deep copy
                }
                new_array.push(new_info);

                PM.Editor.Framework.RecordOperation(PM.RECORD_LAYER_INSERT, pair_num, { // ....... record undo info
                    page_pos: page_idx,
                    layer_pos: layer_idx,
                    data: old_array
                }, {
                    page_pos: page_idx,
                    layer_pos: layer_idx,
                    data: new_array
                }, new_layer.GetDesc() + " 붙여넣기");
                //PM.Editor.Framework.dropTargetCallback && PM.Editor.Framework.dropTargetCallback(drop_id, drop_value);

            });
            return true;
        }
    }
    return false;
}
PM.Core.ProductBase.prototype.MakeMoveLayerCallback = function(scale) {
    var sel_layer = this.dragger.GetSelectedLayer();
    var sel_rect = this.dragger.GetSelectedLayerRect();

    if (sel_rect != null) {
        sel_rect = PM.Util.L2PRect(sel_rect, scale);
    }

    return {
        layer: sel_layer,
        rect: sel_rect
    }
}
PM.Core.ProductBase.prototype.ResizeFromTBoxCallbackProcess = function(scale) {
    var result = this.MakeMoveLayerCallback(scale);
    PM.Editor.Framework.moveLayerCallback && PM.Editor.Framework.moveLayerCallback(result.layer, result.rect);
}
PM.Core.ProductBase.prototype.MovedCallbackProcess = function(scale) {
    if (this.dragger.IsMove() || this.dragger.IsResize() || this.dragger.IsRotate()) {
        var result = this.MakeMoveLayerCallback(scale);
        PM.Editor.Framework.moveLayerCallback && PM.Editor.Framework.moveLayerCallback(result.layer, result.rect);
    }
}

// helper.. (common share function)
PM.Core.ProductBase.prototype.CheckComplete = function() {
    this.is_complete = false;
    if (this.cover) {
        if (!this.cover.CheckComplete()) return false;
    }
    for (var i = 0; i < this.page_array.length; i++) {
        if (!this.page_array[i].CheckComplete()) return false;
    }
    this.is_complete = true;
    return true;
}

PM.Core.ProductBase.prototype.GetTotalPageCount = function() {
    return this.ExtraCount() + this.page_array.length;
}
PM.Core.ProductBase.prototype.GetInnerPageCount = function() {
    return this.page_array.length;
}
PM.Core.ProductBase.prototype.GetPageIndex = function(cur_page) {
    if (cur_page) {
        for (var i = 0; i < this.page_array.length; i++) {
            var page = this.page_array[i];
            if (page == cur_page) {
                return i;
            }
        }

        if (cur_page == this.cover.back_page) {
            return PM.PAGE.COVER_BACK;
        }
        else if (cur_page == this.cover.middle_page) {
            return PM.PAGE.COVER_MIDDLE;
        }
        else if (cur_page == this.cover.front_page) {
            return PM.PAGE.COVER_FRONT;
        }

        if (cur_page == this.prolog) {
            return PM.PAGE.PROLOG;
        }
        else if (cur_page == this.epilog) {
            return PM.PAGE.EPILOG;
        }
    }
    return PM.PAGE.ERROR;
}

PM.Core.ProductBase.prototype.GetSelectedLayer = function() {
    return this.dragger.GetSelectedLayer();
}
PM.Core.ProductBase.prototype.GetSelectedPage = function() {
    return this.dragger.GetSelectedPage();
}
PM.Core.ProductBase.prototype.GetSelectedPageIndex = function() {
    var sel_page = this.dragger.GetSelectedPage();
    if (sel_page) {
        return this.GetPageIndex(sel_page);
    }
    return PM.PAGE.ERROR;
}
PM.Core.ProductBase.prototype.ClearSelect = function() {
    this.dragger.SetSelect(null, null, -1, -1);
}
PM.Core.ProductBase.prototype.SetSelectLayer = function(page, layer) {
    if (layer) {
        var pair_num = PM.Editor.Framework.GetPairNumber();
        this.ResetFocus(pair_num);

        this.dragger.SetSelect(page, layer, -1, -1);
        this.dragger.drag_mode = PM.HIT.NONE;
    }
    else {
        this.ClearSelect();
    }
}

PM.Core.ProductBase.prototype.GetWorkRect = function(pair_num) {
    var size = this.GetPairSize(pair_num);
    return {
        l: this.work_pos.x,
        t: this.work_pos.y,
        w: size.w,
        h: size.h
    }
}
PM.Core.ProductBase.prototype.GetFitScaleFactor = function(dest_w, dest_h) {
    var src = this.GetPairSize(1);
    src.w = Math.max(src.w, this.GetPairSize(0).w);

    return PM.Util.GetScale(dest_w, dest_h, src.w, src.h, true/*inner*/);
}
PM.Core.ProductBase.prototype.GetDropData = function(data) {
    var drop_id = "";
    if (0 == data.indexOf("color")) {
        drop_id = "color";
    }
    else if (0 == data.indexOf("skin")) {
        drop_id = "skin";
    }
    else if (0 == data.indexOf("layout")) {
        drop_id = "layout";
    }
    else if (0 == data.indexOf("icon")) {
        drop_id = "icon";
    }
    else if (0 == data.indexOf("frame")) {
        drop_id = "frame";
    }
    else if (0 == data.indexOf("text")) {
        drop_id = "text";
    }
    else if (0 == data.indexOf("photo")) {
        drop_id = "photo";
    }
    return {
        id: drop_id,
        value: data.substring(drop_id.length)
    }
}

// helper.. (pure virtual function)
PM.Core.ProductBase.prototype.ResetFocus = function(pair_num) {
    console.assert(false, "ResetFocus");
}
PM.Core.ProductBase.prototype.PageCountInPair = function() {
    console.assert(false, "PageCountInPair");
}
PM.Core.ProductBase.prototype.PairCount = function() {
    console.assert(false, "PairCount");
}
PM.Core.ProductBase.prototype.Pair2PageIndex = function(pair_num) {
    console.assert(false, "Pair2PageIndex");
}
PM.Core.ProductBase.prototype.GetPairSize = function(pair_num) {
    console.assert(false, "GetPairSize");
}
PM.Core.ProductBase.prototype.GetPairText = function(pair_num) {
    console.assert(false, "GetPairText");
}
PM.Core.ProductBase.prototype.ExtraCount = function() {
    console.assert(false, "ExtraCount");
}

// 키보드/마우스 액션..
PM.Core.ProductBase.prototype.KeyDown = function(e) {
    return this.dragger.KeyDown(e);
}
PM.Core.ProductBase.prototype.KeyPress = function(e) {
    return this.dragger.KeyPress(e);
}
PM.Core.ProductBase.prototype.ContextMenu = function(e, dc, pair_num, x, y, scale) {
    var point = PM.Util.L2PPoint({x: x, y: y}, scale);
    PM.Editor.Framework.contextMenuCallback && PM.Editor.Framework.contextMenuCallback(point.x, point.y);
}
PM.Core.ProductBase.prototype.Point2Page = function(pair_num, x, y) {
    var idx = this.Pair2PageIndex(pair_num);
    if (idx <= PM.PAGE.ERROR) return null;

    var sel_page = null;
    switch (idx) {
        case PM.PAGE.COVER:
            if (this.cover) {
                if (this.cover.back_page && PM.Util.PtInRect(this.cover.back_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.back_page;
                }
                else if (this.cover.middle_page && PM.Util.PtInRect(this.cover.middle_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.middle_page;
                }
                else if (this.cover.front_page && PM.Util.PtInRect(this.cover.front_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.front_page;
                }
            }
            break;
        case PM.PAGE.PROLOG:
            if (this.prolog && this.page_array[0]) {
                if (PM.Util.PtInRect(this.prolog.GetWorkRect(), x, y)) {
                    sel_page = this.prolog;
                }
                else if (PM.Util.PtInRect(this.page_array[0].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[0];
                }
            }
            break;
        default:
            /*
            if (this.page_array[idx] && this.page_array[idx+1]) {
                if (PM.Util.PtInRect(this.page_array[idx].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx];
                }
                else if (PM.Util.PtInRect(this.page_array[idx+1].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx+1];
                }
            }*/
            if (this.page_array[idx]) {
                if (PM.Util.PtInRect(this.page_array[idx].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx];
                }
                if (sel_page) break;
            }
            if (this.PageCountInPair() > 1 && this.page_array[idx+1]) {
                if (PM.Util.PtInRect(this.page_array[idx+1].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx+1];
                }
                if (sel_page) break;
            }
            break;
    }
    return sel_page;
}
PM.Core.ProductBase.prototype.DblClick = function(e, dc, pair_num, x, y) {
    this.Select(e, dc, pair_num, x, y);
    this.dragger.DblClick(e, dc, x, y);
    this.Up(e, dc, pair_num, x, y);
}
PM.Core.ProductBase.prototype.Select = function(e, dc, pair_num, x, y, scale) {

    this.move_state = null;

    var hit_type = this.dragger.HitTest(dc, x, y);
    if (hit_type == PM.HIT.NONE) {
        var result = this.HitTest(dc, pair_num, x, y);
        this.dragger.SetSelect(result.page, result.layer, x, y);

        if (!result.page && !result.layer) {
            this.ClearSelect();
        }
    }
    else {
        this.dragger.Down(e, dc, x, y);
    }

    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();
    var sel_rect = this.dragger.GetSelectedLayerRect();

    if (sel_layer != null) {
        if (sel_layer.GetType() == PM.TYPE.TEXT) {
            var tbox = sel_layer.GetEditableTextBox();
            if (tbox && tbox.isOverflowText()) {
                PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_TEXT_LEN);
            }
        }

        // undo/redo info..
        if (this.dragger.IsMove() || this.dragger.IsRotate() || this.dragger.IsResize()) {

            this.move_state = { // ............................................................... prepare undo info
                page_pos: this.GetPageIndex(sel_page),
                layer_pos: sel_page.GetLayerIndex(sel_layer),
                move_info: sel_layer.GetMoveInfo()
            };
        }
        else if (this.dragger.IsMoveCrop()) {

            this.move_state = { // ............................................................... prepare undo info
                page_pos: this.GetPageIndex(sel_page),
                layer_pos: sel_page.GetLayerIndex(sel_layer),
                move_info: sel_layer.GetCropInfo()
            };
        }
        else if (this.dragger.IsEditText()) {
            //console.log("edit text");
        }
    }
    if (sel_rect != null) {
        sel_rect = PM.Util.L2PRect(sel_rect, scale);
    }
    PM.Editor.Framework.selectLayerCallback && PM.Editor.Framework.selectLayerCallback(sel_layer, sel_rect);
}
PM.Core.ProductBase.prototype.Move = function(e, dc, pair_num, x, y, scale) {
    var hit_type = PM.HIT.NONE;
    var modified = true;

    if (this.dragger.IsMove()) { // dragging selected layer..

        var result = this.HitTest(dc, pair_num, x, y);
        var sel_page = result.page ? result.page : this.dragger.GetSelectedPage();
        var sel_layer = result.layer ? result.layer : this.dragger.GetSelectedLayer();
        if (sel_page && sel_layer) {
            // 레이어의 센터좌표로 옮겨갈 페이지를 판단한다.
            var page_rect = sel_page.GetWorkRect();
            var layer_center = sel_layer.GetCenterPos();
            var new_page = this.Point2Page(pair_num, page_rect.l + layer_center.x, page_rect.t + layer_center.y);
            if (new_page == this.prolog) new_page = null;

            this.dragger.Move(e, new_page, x, y); // page <-> page..
            hit_type = PM.HIT.MOVE;
        }
    }
    else if (this.dragger.IsResize()) {

        var sel_page = this.dragger.GetSelectedPage();
        var sel_layer = this.dragger.GetSelectedLayer();
        if (sel_page && sel_layer) {
            // 레이어의 센터좌표로 옮겨갈 페이지를 판단한다.
            var page_rect = sel_page.GetWorkRect();
            var layer_center = sel_layer.GetCenterPos();
            var new_page = this.Point2Page(pair_num, page_rect.l + layer_center.x, page_rect.t + layer_center.y);
            if (new_page == this.prolog) new_page = null;

            if (new_page) {
                sel_page = new_page;
            }
        }
        hit_type = this.dragger.Resize(sel_page, x, y);
    }
    else if (this.dragger.IsRotate()) {
        hit_type = this.dragger.Rotate(x, y);
    }
    else if (this.dragger.IsMoveCrop()) {
        hit_type = this.dragger.MoveCrop(x, y);
    }
    else if (this.dragger.IsEditText()) {
        hit_type = this.dragger.EditText(e, x, y);
    }
    else {
        if (this.dragger.IsSelect()) {
            hit_type = this.dragger.HitTest(dc, x, y);
        }

        if (hit_type == PM.HIT.NONE) {
            var result = this.HitTest(dc, pair_num, x, y);
            hit_type = result.layer ? PM.HIT.MOVE : PM.HIT.NONE;
        }
        modified = false;
    }
    this.MovedCallbackProcess(scale);

    return {
        hit_type: hit_type,
        modified: modified
    }
}
PM.Core.ProductBase.prototype.Up = function(e, dc, pair_num, x, y, scale) {

    if (this.dragger.IsMove() || this.dragger.IsResize() || this.dragger.IsRotate()) {
        PM.Editor.Framework.CheckBoundary();

        if (this.move_state != null) {

            var sel_page = this.dragger.GetSelectedPage();
            var sel_layer = this.dragger.GetSelectedLayer();
            var page_idx = this.GetPageIndex(sel_page);
            var layer_idx = sel_page.GetLayerIndex(sel_layer);

            // tbox의 align후에 doc크기가 내부적으로는 이미 갱신되었으나, layer에는 반영이 되지 않은 상태이므로 이곳에서 직접 바꿔준다.
            // 글상자를 페이지 하단에 놓고 글상자 높이를 위에서 아래로 줄이면 Boundary check가 제대로 되지 않는 버그를 위해 수정함. (2016.11.01)
            if (sel_layer.GetType() == PM.TYPE.TEXT && this.dragger.IsResize()) {
                sel_layer.ResizeFromTBoxCallback(sel_layer.width, sel_layer.tbox.edit_h);
                PM.Editor.Framework.CheckBoundary();
            }

            if ((this.move_state.page_pos != page_idx) || (this.move_state.layer_pos != layer_idx) || !sel_layer.IsEqualMoveInfo(this.move_state.move_info)) {

                var detail_desc = "?";
                if (this.dragger.IsMove()) detail_desc = " 위치 변경";
                else if (this.dragger.IsResize()) detail_desc = " 크기 변경";
                else if (this.dragger.IsRotate()) detail_desc = " 회전";

                PM.Editor.Framework.RecordOperation(PM.RECORD_LAYER_MOVE, pair_num, { // ......... record undo info
                    page_pos: this.move_state.page_pos,
                    layer_pos: this.move_state.layer_pos,
                    data: this.move_state.move_info
                }, {
                    page_pos: page_idx,
                    layer_pos: layer_idx,
                    data: sel_layer.GetMoveInfo()
                }, sel_layer.GetDesc() + detail_desc);
            }
        }
    }
    else if (this.dragger.IsMoveCrop()) {

        if (this.move_state != null) {

            var sel_page = this.dragger.GetSelectedPage();
            var sel_layer = this.dragger.GetSelectedLayer();
            var page_idx = this.GetPageIndex(sel_page);
            var layer_idx = sel_page.GetLayerIndex(sel_layer);

            if ((this.move_state.page_pos != page_idx) || (this.move_state.layer_pos != layer_idx) || !sel_layer.IsEqualCropInfo(this.move_state.move_info)) {

                PM.Editor.Framework.RecordOperation(PM.RECORD_PHOTO_CROP, pair_num, { // ......... record undo info
                    page_pos: this.move_state.page_pos,
                    layer_pos: this.move_state.layer_pos,
                    data: this.move_state.move_info
                }, {
                    page_pos: page_idx,
                    layer_pos: layer_idx,
                    data: sel_layer.GetCropInfo()
                }, "사진 크롭");
            }
        }
    }
    else if (this.dragger.IsEditText()) {
        //console.log("no op ..............");
    }

    this.MovedCallbackProcess(scale);
    this.dragger.Up(e, x, y);
    this.move_state = null;
}
PM.Core.ProductBase.prototype.HitTest = function(dc, pair_num, x, y) {
    var idx = this.Pair2PageIndex(pair_num);
    if (idx <= PM.PAGE.ERROR) return {page:null, layer:null}

    var sel_page = null;
    var sel_layer = null;
    switch (idx) {
        case PM.PAGE.COVER:
            if (this.cover) {
                // 1. check layer first
                if (this.cover.back_page) {
                    sel_layer = this.cover.back_page.HitTestLayers(dc, x, y);
                    sel_page = sel_layer ? this.cover.back_page : null;
                    if (sel_layer) break;
                }
                if (this.cover.middle_page) {
                    sel_layer = this.cover.middle_page.HitTestLayers(dc, x, y);
                    sel_page = sel_layer ? this.cover.middle_page : null;
                    if (sel_layer) break;
                }
                if (this.cover.front_page) {
                    sel_layer = this.cover.front_page.HitTestLayers(dc, x, y);
                    sel_page = sel_layer ? this.cover.front_page : null;
                    if (sel_layer) break;
                }

                // 2. check page later (sel_layer == null)
                if (this.cover.back_page && PM.Util.PtInRect(this.cover.back_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.back_page;
                }
                else if (this.cover.middle_page && PM.Util.PtInRect(this.cover.middle_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.middle_page;
                }
                else if (this.cover.front_page && PM.Util.PtInRect(this.cover.front_page.GetWorkRect(), x, y)) {
                    sel_page = this.cover.front_page;
                }
            }
            break;
        case PM.PAGE.PROLOG:
            if (this.prolog && this.page_array[0]) {
                // 1. check layer first
                sel_layer = this.prolog.HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.prolog : null;
                if (sel_layer) break;

                sel_layer = this.page_array[0].HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.page_array[0] : null;
                if (sel_layer) break;

                // 2. check page later (sel_layer == null)
                if (PM.Util.PtInRect(this.prolog.GetWorkRect(), x, y)) {
                    sel_page = this.prolog;
                }
                else if (PM.Util.PtInRect(this.page_array[0].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[0];
                }
            }
            break;
        default:
/*
            if (this.page_array[idx] && this.page_array[idx+1]) {
                // 1. check layer first
                sel_layer = this.page_array[idx].HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.page_array[idx] : null;
                if (sel_layer) break;

                sel_layer = this.page_array[idx+1].HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.page_array[idx+1] : null;
                if (sel_layer) break;

                // 2. check page later (sel_layer == null)
                if (PM.Util.PtInRect(this.page_array[idx].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx];
                }
                else if (PM.Util.PtInRect(this.page_array[idx+1].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx+1];
                }
            }*/
            if (this.page_array[idx]) {
                // 1. check layer first
                sel_layer = this.page_array[idx].HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.page_array[idx] : null;
                if (sel_layer) break;

                // 2. check page later (sel_layer == null)
                if (PM.Util.PtInRect(this.page_array[idx].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx];
                }
                if (sel_page) break;
            }
            if (this.PageCountInPair() > 1 && this.page_array[idx+1]) {
                // 1. check layer first
                sel_layer = this.page_array[idx+1].HitTestLayers(dc, x, y);
                sel_page = sel_layer ? this.page_array[idx+1] : null;
                if (sel_layer) break;

                // 2. check page later (sel_layer == null)
                if (PM.Util.PtInRect(this.page_array[idx+1].GetWorkRect(), x, y)) {
                    sel_page = this.page_array[idx+1];
                }
                if (sel_page) break;
            }
            break;
    }

    return {
        page: sel_page,
        layer: sel_layer
    }
}
PM.Core.ProductBase.prototype.CheckBoundary = function(pair_num) {
    var sel_page = this.dragger.GetSelectedPage();
    var sel_layer = this.dragger.GetSelectedLayer();

    if (sel_page && sel_layer && sel_layer.gid != "spine") {

        // 재단선 기준으로 허용 범위를 판단.
        var ginfo = this.GetCutInfo(pair_num);
        var cut_w = ginfo.cut_w + 5;
        var cut_h = ginfo.cut_h + 5;

        // 페이지와 레이어 영역 계산.
        var page_rect = sel_page.GetWorkRect();
        var layer_center = sel_layer.GetCenterPos();
        var out_rect = sel_layer.GetOutRect();

        // 그리드 먼저 체크
        if (PM.Editor.Framework.GetGridMode()) {
            out_rect.l = Math.floor(out_rect.l/PM.CONFIG.GRID_SPACE) * PM.CONFIG.GRID_SPACE;
            out_rect.t = Math.floor(out_rect.t/PM.CONFIG.GRID_SPACE) * PM.CONFIG.GRID_SPACE;

            layer_center.x = out_rect.l + out_rect.w/2;
            layer_center.y = out_rect.t + out_rect.h/2;

            sel_layer.xpos = layer_center.x - sel_layer.width/2;
            sel_layer.ypos = layer_center.y - sel_layer.height/2;
        }

        // 레이어의 센터좌표로 옮겨갈 페이지를 판단.
        var new_page = this.Point2Page(pair_num, page_rect.l + layer_center.x, page_rect.t + layer_center.y);
        if (new_page == this.prolog) new_page = null;

        // 레이어의 센터좌표가 허용 범위를 벗어난 경우
        if (!new_page) {
            if (layer_center.x < cut_w) {
                layer_center.x = cut_w;
            }
            else if (layer_center.x > (page_rect.w - cut_w)) {
                layer_center.x = page_rect.w - cut_w;
            }

            if (layer_center.y < cut_h) {
                layer_center.y = cut_h;
            }
            else if (layer_center.y > (page_rect.h - cut_h)) {
                layer_center.y = page_rect.h - cut_h;
            }

            sel_layer.xpos = layer_center.x - sel_layer.width/2;
            sel_layer.ypos = layer_center.y - sel_layer.height/2;
        }

        // 텍스트 레이어는 경계에 걸치지 않도록 처리
        if (sel_layer.GetType() == PM.TYPE.TEXT) {
            if (out_rect.l < cut_w) {
                out_rect.l = cut_w;
            }
            else if (out_rect.l + out_rect.w > (page_rect.w - cut_w)) {
                if (out_rect.w > (page_rect.w - cut_w*2)) {
                    out_rect.l = cut_w;
                }
                else {
                    out_rect.l = page_rect.w - out_rect.w - cut_w;
                }
            }

            if (out_rect.t < cut_h) {
                out_rect.t = cut_h;
            }
            else if (out_rect.t + out_rect.h > (page_rect.h - cut_h)) {
                if (out_rect.h > (page_rect.h - cut_h*2)) {
                    out_rect.t = cut_h;
                }
                else {
                    out_rect.t = page_rect.h - out_rect.h - cut_h;
                }
            }

            var new_center_x = out_rect.l + out_rect.w/2;
            var new_center_y = out_rect.t + out_rect.h/2;

            sel_layer.xpos = new_center_x - sel_layer.width/2;
            sel_layer.ypos = new_center_y - sel_layer.height/2;
        }

        // 레이플랫 페이지에 글상자가 중간에 걸치는 것 방지.
        // 내 생각에는 합성 서버가 지원할 수 있도록 바뀌는 것이 맞는 것 같음. 일단 그동안 임시처리.
        if (sel_layer.GetType() == PM.TYPE.TEXT && sel_page.layout_style == "layflat") {
            var page_center_x = page_rect.w/2;
            if (page_center_x > out_rect.l && page_center_x < (out_rect.l + out_rect.w)) {
                var left_w = page_center_x - out_rect.l;
                var right_w = (out_rect.l + out_rect.w) - page_center_x;
                if (left_w > right_w) {
                    out_rect.l = page_center_x - out_rect.w - cut_w;
                }
                else {
                    out_rect.l = page_center_x + cut_w;
                }

                var new_center_x = out_rect.l + out_rect.w/2;
                var new_center_y = out_rect.t + out_rect.h/2;

                sel_layer.xpos = new_center_x - sel_layer.width/2;
                sel_layer.ypos = new_center_y - sel_layer.height/2;

                if (out_rect.w > (page_rect.w/2 - cut_w*2)) {
                    PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_TEXT_SIZE);
                }
            }
        } // .............................................................................

        // 권고 메시지
        if (sel_layer.GetType() == PM.TYPE.TEXT) { // 최대크기를 제한하는 대신에 경고 문구로 대체함.
            if (out_rect.w > (page_rect.w - cut_w*2) || out_rect.h > (page_rect.h - cut_h*2)) {
                PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_TEXT_SIZE);
            }
        }

        if (this.cover && pair_num == 0) {
            if (this.cover.middle_page && sel_layer.GetType() == PM.TYPE.IMAGE) {
                if (new_page == this.cover.back_page) {
                    if (out_rect.l + out_rect.w > page_rect.w) {
                        PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_SPINE_AREA);
                    }
                }
                else if (new_page == this.cover.front_page) {
                    if (out_rect.l < 0) {
                        PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_SPINE_AREA);
                    }
                }
            }
        }
        else if (this.prolog && ((new_page == null) || (new_page == this.page_array[0]))) {
            if (out_rect.l < 0) {
                PM.Editor.Framework.ShowMessageBar(PM.CONFIG.MESSAGE_CHECK_PROLOG_AREA);
            }
        }
    }
}

// pure virtual function
PM.Core.ProductBase.prototype.GetCutInfo = function(pair_num) {
    console.assert(false, "GetCutInfo");
}
PM.Core.ProductBase.prototype.DragOver = function(e, dc, pair_num, x, y) {
    console.assert(false, "DragOver");
}
PM.Core.ProductBase.prototype.Drop = function(e, dc, pair_num, x, y) {
    console.assert(false, "Drop");
}
PM.Core.ProductBase.prototype.DropDefault = function(pair_num, target_id, target_value) {
    console.assert(false, "DropDefault");
}

// 기타..
PM.Core.ProductBase.prototype.MakePreviewImages = function(is_pair_mode) {
    console.assert(false, "MakePreviewImages");
}
PM.Core.ProductBase.prototype.ChangeAll = function(pair_num, target_id, target_value) {
    var old_array = [];
    var new_array = [];
    var promises = [];

    switch (target_id) {
        case "color":
            for (var i = 0; i < this.page_array.length; i++) {
                var page = this.page_array[i];
                if (page) {
                    old_array.push({ skin_link: page.skin_link, color: page.color }); // ......... prepare undo info
                    promises.push(page.ChangeColor(target_value));
                }
            }
            break;
        case "skin":
            for (var i = 0; i < this.page_array.length; i++) {
                var page = this.page_array[i];
                if (page) {
                    var target_object = JSON.parse(target_value);
                    if (target_object.kind == page.skin_kind && target_object.type == page.skin_type) {
                        old_array.push({ skin_link: page.skin_link, color: page.color }); // ..... prepare undo info
                        promises.push(page.ChangeSkin(PM.URL.SKIN_FILE + target_object.link));
                    }
                }
            }
            break;
        case "layout":
            var target_object = JSON.parse(target_value);
            if (target_object.type == "page") {
                for (var i = 0; i < this.page_array.length; i++) {
                    var page = this.page_array[i];
                    if (page && !page.IsLayerLock()) {
                        if (target_object.kind == page.layout_kind && target_object.type == page.layout_type) {

                            var old_info = page.SaveJson();
                            old_array.push(old_info); // ......................................... prepare undo info
                            promises.push(page.ChangeLayout(PM.URL.LAYOUT_FILE + target_object.link, null, null));
                        }
                    }
                }
            }
            else { // if (target_object.type == "page_spread" or "cover") {
            }
            break;
    }
    if (old_array.length <= 0) {
        PM.Editor.Framework.ShowMessageBar("실행할 수 없습니다.");
        return;
    }
    this.ClearSelect();

    var that = this;
    $.when.apply($, promises).then (
        function() { // succeed

            var record_type = PM.RECORD_UNKNOWN;
            var desc = "";

            switch (target_id) {
                case "color":
                    record_type = PM.RECORD_PAGE_BKCOLOR;
                    desc = "배경색 전체일괄적용";
                    for (var i = 0; i < that.page_array.length; i++) {
                        var page = that.page_array[i];
                        if (page) {
                            new_array.push({ skin_link: page.skin_link, color: page.color }); // . prepare undo info
                        }
                    }
                    break;
                case "skin":
                    record_type = PM.RECORD_PAGE_BKIMAGE;
                    desc = "배경스킨 전체일괄적용";
                    for (var i = 0; i < that.page_array.length; i++) {
                        var page = that.page_array[i];
                        if (page) {
                            new_array.push({ skin_link: page.skin_link, color: page.color }); // . prepare undo info
                        }
                    }
                    break;
                case "layout":
                    record_type = PM.RECORD_PAGE_LAYOUT;
                    desc = "레이아웃 전체일괄적용";
                    for (var i = 0; i < that.page_array.length; i++) {
                        var page = that.page_array[i];
                        if (page) {
                            page.layout_style = "normal"; // type:page일때만 일괄적용이 가능하므로 모든 style은 normal
                            var new_info = page.SaveJson();
                            new_array.push(new_info); // ......................................... prepare undo info
                        }
                    }
                    break;
            }

            PM.Editor.Framework.RecordOperation(record_type, pair_num, { // ...................... record undo info
                page_pos: 0,
                layer_pos: -1,
                data: old_array
            }, {
                page_pos: 0,
                layer_pos: -1,
                data: new_array
            }, desc);

            PM.Editor.Framework.dropTargetCallback && PM.Editor.Framework.dropTargetCallback("all", target_id);
        },
        function() { // fail
            PM.Editor.Framework.ShowMessageBar(desc + " 실패");
            PM.Editor.Framework.dropTargetCallback && PM.Editor.Framework.dropTargetCallback("", "");
        }
    );

    return (promises.length > 0);
}
PM.Core.ProductBase.prototype.DrawPair = function(dc, pair_num, width, height) {
    console.assert(false, "DrawPair");
}

// 입출력
PM.Core.ProductBase.prototype.LoadJson = function(data) {
    console.assert(false, "LoadJson");
}
PM.Core.ProductBase.prototype.SaveJson = function() {
    console.assert(false, "SaveJson");
}

