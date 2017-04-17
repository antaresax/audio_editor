//
// Layer
PM.Core.Layer = function() {
    this.gid = "";              //
    this.require = false;       //
    this.movelock = false;      //
    this.resizelock = false;    //
    this.zorderlock = false;    //
    this.removelock = false;    //

    this.xpos = 0.0;            // 코디 레이어 영역 좌표
    this.ypos = 0.0;            //
    this.width = 0.0;           //
    this.height = 0.0;          //
    this.radian = 0.0;          //
};

PM.Core.Layer.prototype.CopyProperty = function(layer) {
    layer.gid = this.gid;
    layer.require = this.require;
    layer.movelock = this.movelock;
    layer.resizelock = this.resizelock;
    layer.removelock = this.removelock;
    layer.xpos = this.xpos;
    layer.ypos = this.ypos;
    layer.width = this.width;
    layer.height = this.height;
    layer.radian = this.radian;
    return layer;
}

PM.Core.Layer.prototype.GetMoveInfo = function() {
    return {
        xpos: this.xpos,
        ypos: this.ypos,
        width: this.width,
        height: this.height,
        radian: this.radian
    }
}
PM.Core.Layer.prototype.SetMoveInfo = function(info) {
    this.xpos = info.xpos;
    this.ypos = info.ypos;
    this.width = info.width;
    this.height = info.height;
    this.radian = info.radian;
}
PM.Core.Layer.prototype.IsEqualMoveInfo = function(info) {
    return ((this.xpos == info.xpos) 
        && (this.ypos == info.ypos) 
        && (this.width == info.width) 
        && (this.height == info.height) 
        && (this.radian == info.radian));
}/*
PM.Core.Layer.prototype.GetMoveInfoDesc = function() {
    return parseInt(this.xpos) + ", " + parseInt(this.ypos) + ", " + parseInt(this.width) + ", " + parseInt(this.height) + ", " + PM.Util.ToAngle(this.radian).toFixed(2);
}*/

PM.Core.Layer.prototype.PrepareDC = function(dc, x, y) {
    dc.save();
    dc.translate(x + this.xpos, y + this.ypos);
    if (this.radian) {
        dc.translate(this.width/2, this.height/2);
        dc.rotate(this.radian);
        dc.translate(-this.width/2, -this.height/2);
    }
}

PM.Core.Layer.prototype.ReleaseDC = function(dc) {
    dc.restore();
}

PM.Core.Layer.prototype.GetType = function() {
    return this.type;
}

PM.Core.Layer.prototype.GetRect = function() {
    return {
        l: this.xpos,
        t: this.ypos,
        w: this.width,
        h: this.height
    }
}

PM.Core.Layer.prototype.GetCenterPos = function() {
    return {
        x: this.xpos + this.width/2,
        y: this.ypos + this.height/2
    }
}

PM.Core.Layer.prototype.NonRotatedPoint = function(cx, cy, x, y) {
    var radian = -this.radian;
    return this.GetRotatePoint(radian, cx, cy, x, y);
}

PM.Core.Layer.prototype.GetRotatePoint = function(radian, cx, cy, x, y) {
    var point = {x:x, y:y};
    if (radian) {
        point.x = (x-cx)*Math.cos(radian) - (y-cy)*Math.sin(radian) + cx;
        point.y = (x-cx)*Math.sin(radian) + (y-cy)*Math.cos(radian) + cy;
    }
    return point;
}

PM.Core.Layer.prototype.GetRotateInnerPoints = function(cx, cy) {
    var points = [];
    points.push(this.GetRotatePoint(this.radian, cx, cy, this.xpos, this.ypos));
    points.push(this.GetRotatePoint(this.radian, cx, cy, this.xpos+this.width, this.ypos));
    points.push(this.GetRotatePoint(this.radian, cx, cy, this.xpos, this.ypos+this.height));
    points.push(this.GetRotatePoint(this.radian, cx, cy, this.xpos+this.width, this.ypos+this.height));
    return points;
}

PM.Core.Layer.prototype.Points2OutRect = function(points) {
    if (points.length != 4) return {l:0, t:0, w:0, h:0};

    var min_x = Math.min(Math.min(points[0].x, points[1].x), Math.min(points[2].x, points[3].x));
    var min_y = Math.min(Math.min(points[0].y, points[1].y), Math.min(points[2].y, points[3].y));
    var max_x = Math.max(Math.max(points[0].x, points[1].x), Math.max(points[2].x, points[3].x));
    var max_y = Math.max(Math.max(points[0].y, points[1].y), Math.max(points[2].y, points[3].y));

    return {
        l: min_x,
        t: min_y,
        w: (max_x - min_x),
        h: (max_y - min_y)
    }
}

PM.Core.Layer.prototype.GetOutRect = function() {
    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;
    var points = this.GetRotateInnerPoints(cx, cy);
    var out_rect = this.Points2OutRect(points);
    return out_rect;
}

PM.Core.Layer.prototype.DrawExtra = function(dc, order_num) {
    if (!PM.DEBUG) return;
    if (PM.Editor.Framework.IsPreviewMode()) return;
    
    dc.font = "12px Nanum Gothic";
    dc.fillStyle = "#ff0000";
    dc.textAlign = "center";
    dc.textBaseline = "middle";

    dc.fillText(order_num, 10, 10, 30);
}

PM.Core.Layer.prototype.DrawHighlight = function(dc, x, y) {
    this.PrepareDC(dc, x, y);
    PM.Util.DrawRect(dc, 0, 0, this.width, this.height, 1.5, "yellow", null);
    this.ReleaseDC(dc);
}

PM.Core.Layer.prototype.DrawController = function(dc, x, y, is_editmode) {
    this.PrepareDC(dc, x, y);

    var shift_state = PM.Editor.Framework.IsShiftState();
    
    var line_w = 1;
    var stroke_color = is_editmode ? PM.COLOR_DRAGGER_FOCUS_STROKE : PM.COLOR_DRAGGER_NORMAL_STROKE;

    PM.Util.DrawDashRect(dc, 0, 0, this.width, this.height, line_w, stroke_color, null); // layer

    if (!is_editmode) {
        var cx = 0;
        var cy = 0;
        var radius = PM.CONFIG.CONTROLLER_RADIUS;
        //var fill_color = is_editmode ? PM.COLOR_DRAGGER_FOCUS_FILL : PM.COLOR_DRAGGER_NORMAL_FILL;
        var fill_color = PM.COLOR_DRAGGER_NORMAL_FILL;

        if (!this.movelock && !shift_state) {
            var bottom = this.resizelock ? 0 : -radius;
            PM.Util.DrawDashLine(dc, this.width/2, -30+radius, this.width/2, bottom, 1, stroke_color); // |
        }

        cx = this.width/2;
        cy = -30;
        if (!this.movelock && !shift_state) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // rotate point
        }

        cx = this.width/2;
        cy = 0;
        if (!this.resizelock && !shift_state) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // top
        }

        cx = this.width;
        cy = this.height/2;
        if (!this.resizelock && !shift_state) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // right
        }

        cx = this.width/2;
        cy = this.height;
        if (!this.resizelock && !shift_state) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // bottom
        }

        cx = 0;
        cy = this.height/2;
        if (!this.resizelock && !shift_state) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // left
        }

        cx = 0;
        cy = 0;
        if (!this.resizelock) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // lt
        }

        cx = this.width;
        cy = 0;
        if (!this.resizelock) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // rt
        }

        cx = this.width;
        cy = this.height;
        if (!this.resizelock) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // rb
        }

        cx = 0;
        cy = this.height;
        if (!this.resizelock) {
            PM.Util.DrawCircle(dc, cx, cy, radius, line_w, stroke_color, fill_color); // lb
        }
    }
//console.log("shift_state:" + PM.Editor.Framework.IsShiftState());
    this.ReleaseDC(dc);
}

PM.Core.Layer.prototype.HitTest = function(dc, x, y) {
    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;

    var point = this.NonRotatedPoint(cx, cy, x, y);
    var rect = this.GetRect();
    if (PM.Util.PtInRect(rect, point.x, point.y)) {
        return this;
    }
    return null;
}

PM.Core.Layer.prototype.HitTestController = function(dc, x, y) {
    var shift_state = PM.Editor.Framework.IsShiftState();
    
    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;

    var point = this.NonRotatedPoint(cx, cy, x, y);
    var rect = this.GetRect();
    var radius = PM.CONFIG.CONTROLLER_RADIUS;

    cx = rect.l + this.width/2;
    cy = rect.t -30;
    if (!this.movelock && !shift_state && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // rotate point
        return PM.HIT.ROTATE;
    }

    cx = rect.l + this.width/2;
    cy = rect.t + 0;
    if (!this.resizelock && !shift_state && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // top
        return PM.HIT.RESIZE_T;
    }

    cx = rect.l + this.width;
    cy = rect.t + this.height/2;
    if (!this.resizelock && !shift_state && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // right
        return PM.HIT.RESIZE_R;
    }

    cx = rect.l + this.width/2;
    cy = rect.t + this.height;
    if (!this.resizelock && !shift_state && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // bottom
        return PM.HIT.RESIZE_B;
    }

    cx = rect.l + 0;
    cy = rect.t + this.height/2;
    if (!this.resizelock && !shift_state && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // left
        return PM.HIT.RESIZE_L;
    }

    cx = rect.l + 0;
    cy = rect.t + 0;
    if (!this.resizelock && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // lt
        return PM.HIT.RESIZE_LT;
    }

    cx = rect.l + this.width;
    cy = rect.t + 0;
    if (!this.resizelock && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // rt
        return PM.HIT.RESIZE_RT;
    }

    cx = rect.l + this.width;
    cy = rect.t + this.height;
    if (!this.resizelock && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // rb
        return PM.HIT.RESIZE_RB;
    }

    cx = rect.l + 0;
    cy = rect.t + this.height;
    if (!this.resizelock && PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // lb
        return PM.HIT.RESIZE_LB;
    }
/*
    radius = 30;
    cx = rect.l + this.width/2;
    cy = rect.t + this.height/2;
    if (PM.Util.PtInCircle(cx, cy, radius, point.x, point.y)) { // crop move
        return PM.HIT.CROP_MOVE;
    }
*/
    if (PM.Util.PtInRect(rect, point.x, point.y)) { // TBox활성화를 위해서 movelock 체크는 패쓰~
        return PM.HIT.MOVE;
    }
    return PM.HIT.NONE;
}


PM.Core.Layer.prototype.Move = function(prev_x, prev_y, move_x, move_y) {
    if (this.movelock) return;

    var offset_x = move_x - prev_x;
    var offset_y = move_y - prev_y;

    this.xpos += offset_x;
    this.ypos += offset_y;
}
/*
PM.Core.Layer.prototype.ResizeFromTBoxCallback = function(new_w, new_h) { // new_w는 사용안함
    if (this.resizelock) return;

    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;

    this.height = (new_h >= 30) ? new_h : 30;

    this.RecalcXY(cx, cy);
}
*/

PM.Core.Layer.prototype.ResizeToFixedRate = function(mode, offset_x, offset_y, old_w, old_h) {
    // old_w : old_h = new_w : new_h

    var diff = 0;
    var new_w = this.width;
    var new_h = this.height;
    
    if (Math.abs(offset_x) > Math.abs(offset_y)) { // width를 기준으로 height 보정

        new_h = (new_w * old_h) / old_w;
        diff = this.height - new_h;
        
        this.height = new_h;
        if (mode == PM.HIT.RESIZE_LT || mode == PM.HIT.RESIZE_RT) { // 상단 두 점은 y좌표를 바꾼다.
            this.ypos += diff;
        }
    }
    else {                                         // height를 기준으로 width 보정

        new_w = (new_h * old_w) / old_h;
        diff = this.width - new_w;
        
        this.width = new_w;
        if (mode == PM.HIT.RESIZE_LT || mode == PM.HIT.RESIZE_LB) { // 좌측 두 점은 x좌표를 바꾼다.
            this.xpos += diff;
        }
    }                    
}

PM.Core.Layer.prototype.Resize = function(mode, prev_x, prev_y, move_x, move_y) {
    if (this.resizelock) return;

    var shift_state = PM.Editor.Framework.IsShiftState();
    
    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;
    var prev = this.NonRotatedPoint(cx, cy, prev_x, prev_y);
    var move = this.NonRotatedPoint(cx, cy, move_x, move_y);
    
    var old_w = this.width;
    var old_h = this.height;
    var offset_x = move.x - prev.x;
    var offset_y = move.y - prev.y;

    switch (mode) {
        case PM.HIT.RESIZE_T:
            if ((this.height - offset_y) >= 30) {
                this.ypos += offset_y;
                this.height -= offset_y;
            }
            break;
        case PM.HIT.RESIZE_B:
            if ((this.height + offset_y) >= 30) {
                this.height += offset_y;
            }
            break;
        case PM.HIT.RESIZE_L:
            if ((this.width - offset_x) >= 30) {
                this.xpos += offset_x;
                this.width -= offset_x;
            }
            break;
        case PM.HIT.RESIZE_R:
            if ((this.width + offset_x) >= 30) {
                this.width += offset_x;
            }
            break;
        case PM.HIT.RESIZE_LT:
            if ((this.width - offset_x) >= 30 && (this.height - offset_y) >= 30) {
                this.xpos += offset_x;
                this.width -= offset_x;
                this.ypos += offset_y;
                this.height -= offset_y;
                
                if (shift_state) this.ResizeToFixedRate(mode, offset_x, offset_y, old_w, old_h);
            }
            break;
        case PM.HIT.RESIZE_RT:
            if ((this.width + offset_x) >= 30 && (this.height - offset_y) >= 30) {
                this.width += offset_x;
                this.ypos += offset_y;
                this.height -= offset_y;
                
                if (shift_state) this.ResizeToFixedRate(mode, offset_x, offset_y, old_w, old_h);
            }
            break;
        case PM.HIT.RESIZE_RB:
            if ((this.width + offset_x) >= 30 && (this.height + offset_y) >= 30) {
                this.width += offset_x;
                this.height += offset_y;

                if (shift_state) this.ResizeToFixedRate(mode, offset_x, offset_y, old_w, old_h);
            }
            break;
        case PM.HIT.RESIZE_LB:
            if ((this.width - offset_x) >= 30 && (this.height + offset_y) >= 30) {
                this.xpos += offset_x;
                this.width -= offset_x;
                this.height += offset_y;
             
                if (shift_state) this.ResizeToFixedRate(mode, offset_x, offset_y, old_w, old_h);
            }
            break;
        default: break;
    }

    this.RecalcXY(cx, cy);
}

PM.Core.Layer.prototype.RecalcXY = function(center_x, center_y) {
    if (this.radian) {
        // * 회전된 레이어의 크기를 변경할 때는, 0도로 변환해서 크기를 변경한 후에 다시 회전하는 방법을 사용한다.
        // * 이때, 크기를 변경하면 센터값이 변경되어 다시 회전했을 때 문제가 생긴다.
        // * 따라서, 크기를 변경한 후에 아래와 같은 보정 작업이 필요함.
        //
        // 1. 변경되기 이전의 센터값으로 회전한다.
        // 2. 회전 후에 새로운 센터값을 구한다.
        // 3. 새로운 센터값으로 부터 xpos, ypos reset!!

        // 1.
        var points = this.GetRotateInnerPoints(center_x, center_y);

        // 2.
        var rect = this.Points2OutRect(points);
        var new_center_x = rect.l + rect.w/2.0;
        var new_center_y = rect.t + rect.h/2.0;

        // 3.
        var new_pos = this.NonRotatedPoint(new_center_x, new_center_y, points[0].x, points[0].y);
        this.xpos = new_pos.x;
        this.ypos = new_pos.y;
    }
}

PM.Core.Layer.prototype.Rotate = function(x1, y1, x2, y2) {
    if (this.movelock) return;

    var cx = this.xpos + this.width/2;
    var cy = this.ypos + this.height/2;

    x1 -= cx;
    x2 -= cx;
    y1 = cy - y1;
    y2 = cy - y2;
    //console.log("p1: "+x1 + "," + y1);
    //console.log("p2: "+x2 + "," + y2);

    var radian1 = Math.atan2(x1, y1);
    var radian2 = Math.atan2(x2, y2);
    if (radian1 < 0) radian1 = Math.PI*2 + radian1;
    if (radian2 < 0) radian2 = Math.PI*2 + radian2;
    //console.log("angle1: " + PM.Util.ToAngle(radian1));
    //console.log("angle2: " + PM.Util.ToAngle(radian2));

    this.radian += (radian2 - radian1);
    if (this.radian < 0) this.radian += Math.PI*2;
    if (this.radian > Math.PI*2) this.radian -= Math.PI*2;
    //console.log(">>> : " + PM.Util.ToAngle(this.radian));
}

PM.Core.Layer.prototype.RotateAngle = function(angle) {
    if (this.movelock) return false;
    if (angle != 90 && angle != -90) return false;

    var prev_angle = PM.Util.ToAngle(this.radian);
    if (prev_angle < 0) prev_angle += 360;
    if (prev_angle >= 360) prev_angle -= 360;

    if (angle > 0) {
        if (prev_angle < 90) {
            prev_angle = 0;
        }
        else if (prev_angle < 180) {
            prev_angle = 90;
        }
        else if (prev_angle < 270) {
            prev_angle = 180;
        }
        else if (prev_angle < 360) {
            prev_angle = 270;
        }
    }
    else {
        if (prev_angle > 0 && prev_angle <= 90) {
            prev_angle = 90;
        }
        else if (prev_angle > 90 && prev_angle <= 180) {
            prev_angle = 180;
        }
        else if (prev_angle > 180 && prev_angle <= 270) {
            prev_angle = 270;
        }
        else {
            prev_angle = 360;
        }
    }

    var new_angle = prev_angle + angle;
    if (new_angle < 0) new_angle += 360;
    if (new_angle >= 360) new_angle -= 360;

    this.radian = PM.Util.ToRadian(new_angle);
    return true;
}

PM.Core.Layer.prototype.Parse = function($item) {
    var that = this;

    that.gid        = $item.attr("gid").toLowerCase();
    that.require    = ($item.attr("require") === "true");
    that.movelock   = ($item.attr("movelock") === "true");
    that.resizelock = ($item.attr("resizelock") === "true");
    that.zorderlock = ($item.attr("zorderlock") === "true");
    that.removelock = ($item.attr("removelock") === "true");

    $layer_rect = $item.find("rect");
    that.xpos   = parseFloat($layer_rect.attr("x"));
    that.ypos   = parseFloat($layer_rect.attr("y"));
    that.width  = parseFloat($layer_rect.attr("width"));
    that.height = parseFloat($layer_rect.attr("height"));

    var angle = parseFloat($layer_rect.attr("angle"));
    if (isNaN(angle)) angle = 0;
    if (angle < 0) angle += 360;
    if (angle > 360) angle -= 360;

    // 책등을 제외하고, 레이어의 XML의 좌상단 좌표는 회전정보에 따라 다르다.
    // 따라서, 회전정보를 참고하여 좌상단 좌표를 내부에서 사용 가능한 형태로 정규화해야 한다.
    if (that.gid != "spine" && angle != 0) {

        // XML상의 정보는 좌상단을 기준으로 회전함.
        // 따라서, 회전 이후의 중심점을 구하고 중심점을 기준으로 xpos와 ypos를 새로 구해야 한다.

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
    // that.movelock = that.resizelock = that.zorderlock = that.removelock = (that.gid == "spine");
    if (that.gid == "spine") {
        that.movelock = that.resizelock = that.zorderlock = that.removelock = true;
    }
    else {
        that.movelock = that.resizelock = that.zorderlock = that.removelock = false;
    }
}


PM.Core.Layer.prototype.LoadJson = function(data) {
    this.gid = data.gid;
    this.require = data.require;
    this.movelock = data.movelock;
    this.resizelock = data.resizelock;
    this.zorderlock = data.zorderlock;
    this.removelock = data.removelock;

    this.xpos = data.xpos;
    this.ypos = data.ypos;
    this.width = data.width;
    this.height = data.height;
    this.radian = data.radian;
    return true;
}

PM.Core.Layer.prototype.SaveJson = function() {
    var ret_json = '\n';
    ret_json += ('        "gid": "' + this.gid + '"');
    ret_json += (', "require": ' + this.require);
    ret_json += (', "movelock": ' + this.movelock);
    ret_json += (', "resizelock": ' + this.resizelock);
    ret_json += (', "zorderlock": ' + this.zorderlock);
    ret_json += (', "removelock": ' + this.removelock);

    ret_json += (', "xpos": ' + this.xpos);
    ret_json += (', "ypos": ' + this.ypos);
    ret_json += (', "width": ' + this.width);
    ret_json += (', "height": ' + this.height);
    ret_json += (', "radian": ' + this.radian);

    var out_rect = this.GetOutRect();
    ret_json += (', "out_x": ' + out_rect.l);
    ret_json += (', "out_y": ' + out_rect.t);
    ret_json += (', "out_w": ' + out_rect.w);
    ret_json += (', "out_h": ' + out_rect.h);

    return ret_json;
}
