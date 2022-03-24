// 初始化主画布
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// 初始化指针画布
const cursor_canvas = document.getElementById("cursor_canvas");
const cursor = cursor_canvas.getContext("2d");
// 初始化标记画布
const stamp_canvas = document.getElementById("stamp_canvas");
const stamp = stamp_canvas.getContext("2d");
// 宽高初始化
let [w, h] = [748, 1058];
canvas.width = w;
canvas.height = h;
cursor_canvas.width = w;
cursor_canvas.height = h;
stamp_canvas.width = w;
stamp_canvas.height = h;
// 初始化指针
let t = {
    nowX: 200,
    nowY: 200,
    heading: 0,
}
let cache = [];
let cache_index = 0;
function draw_cursor() {
    // 指针动态重绘
    cursor.clearRect(0, 0, 2000, 2000);
    cursor.beginPath();
    cursor.arc(t.nowX, t.nowY, 3, 0, Math.PI * 2);
    cursor.closePath();
    cursor.fillStyle = "#000000";
    cursor.fill();
}
/*便捷功能区*/
function dToR(heading) {
    // 度数弧度转换
    return Math.PI / 180 * heading
}
function setPos(distance = 20) {
    // 设定指针新位置
    t.nowX += distance * Math.cos(dToR(t.heading));
    t.nowY += distance * Math.sin(dToR(t.heading));
}
function draw(distance = 20) {
    // 前进(distance默认20步长)
    cache.push({nowX:t.nowX,nowY:t.nowY,heading:t.heading});
    cache_index+=1;
    ctx.beginPath();
    ctx.moveTo(t.nowX, t.nowY);
    setPos(distance);
    ctx.lineTo(t.nowX, t.nowY);
    ctx.stroke();
    draw_cursor();
}
function startTrans() {
    // 开始变换画布坐标系
    ctx.save();
    ctx.translate(t.nowX, t.nowY);
    ctx.rotate(dToR(t.heading));
}
function endTrans() {
    // 恢复画布坐标系
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
/*便捷功能区结束*/

/*移动功能区*/
const ne = document.getElementById("ne");
const nw = document.getElementById("nw");
const sw = document.getElementById("sw");
const se = document.getElementById("se");
function set_ne() {
    // 右上
    t.heading = -30;
}
function set_se() {
    // 右下
    t.heading = 30;
}
function set_sw() {
    // 左下
    t.heading = 150;
}
function set_nw() {
    // 左上
    t.heading = -150;
}
function set_up() {
    t.heading = -90;
}
function set_dn() {
    t.heading = 90;
}
function draw_coordinates() {
    ctx.save()
    ctx.font = '16px 黑体 bold';
    ctx.fillStyle = 'black';
    ctx.clearRect(629, 1, 118, 118);
    let img = new Image();
    img.src = '/images/coordinate.svg';
    img.onload=()=>{ctx.drawImage(img,628,3);};
    ctx.fillText('上', 680, 18);
    ctx.fillText('下', 680, 110);
    ctx.fillText(ne.innerHTML, 727, 35);
    ctx.fillText(nw.innerHTML, 635, 35);
    ctx.fillText(se.innerHTML, 727, 92);
    ctx.fillText(sw.innerHTML, 635, 92);
    ctx.restore();
}
function change_coordinateStateBtn() {
    $('#basicPanel').toggle();
    let txt = $('#coordinateStateBtn');
    (txt.text() == '隐藏') ? txt.text('显示') : txt.text('隐藏');
}
function change_button_text() {
    // 变更坐标系
    let temp = ne.innerHTML;
    ne.innerHTML = nw.innerHTML;
    nw.innerHTML = sw.innerHTML;
    sw.innerHTML = se.innerHTML;
    se.innerHTML = temp;
    ctx.clearRect(629, 1, 118, 118);
    draw_coordinates();
}
function pipe_join() {
    // 相交打断
    setPos(-1);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    draw(-4);
    setPos(6);
    draw(4);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    draw(15);
}
function setDegree() {
    //设置任意方向
    let degree = parseInt(prompt("输入整数角度(仅数字)，右为0，顺时针0~360"))
    if (degree >= 0 && degree <= 360) {
        t.heading = degree;
    }
}
/*移动功能区结束*/

/*标记功能区*/
function draw_stamp(color = "green") {
    stamp.beginPath();
    stamp.arc(t.nowX, t.nowY, 6, 0, Math.PI * 2);
    stamp.closePath();
    stamp.fillStyle = color;
    stamp.fill();
}
let stamps = [];
let stamp_count = 0;
function add_stamp() {
    stamps[stamp_count] = [t.nowX, t.nowY];
    stamp_count += 1;
    $('#chooseStamp').append(`<li><button class='liBtn' onclick='goto_stamp(${stamp_count})'>第${stamp_count}个标记</button></li>`);
    draw_stamp();
}
function goto_stamp(index = 1) {
    if (index > stamp_count) {
        alert("超出已有标记个数，请重试！");
        return
    }
    t.nowX = stamps[index - 1][0];
    t.nowY = stamps[index - 1][1];
    draw_cursor();
}
function clear_stamp() {
    stamps = [];
    stamp_count = 0;
    $('#chooseStamp > li').remove();
    stamp.clearRect(0, 0, 2000, 2000);
}
/*标记功能区结束*/

/*坐标功能区*/
function slightly_adjust(i) {
    switch (i) {
        case 1: t.nowY -= 0.5; break;
        case 2: t.nowX -= 0.5; break;
        case 3: t.nowX += 0.5; break;
        case 4: t.nowY += 0.5; break;
    };
    draw_cursor();
    ;
}
function set_cursor() {
    // 设置坐标
    t.nowX = dest_x;
    t.nowY = dest_y;
    draw_cursor();
    show_cursor();
}
let color = "black";
let font = "12px Helvetica";
function font_setting() {
    $('#font_setting').hide();
    color = $('#fontColor').val();
    font = $('#fontSize').val() + " " + $('#fontFamily').val();
}
function add_word() {
    // 添加文字
    let word = prompt("请输入要添加的文字");
    if (word !== null && word !== "") {
        cache.push({nowX:t.nowX,nowY:t.nowY,heading:t.heading});
        cache_index+=1;
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(word, t.nowX, t.nowY);
    }
}
function setPosByCursor() {
    cursor_canvas.style.cursor = "crossHair";
    cursor_canvas.addEventListener("click", myFunc);
}
function myFunc(event) {
    getMousePos(canvas, event);
}
function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left * (canvas.width / rect.width);
    let y = event.clientY - rect.top * (canvas.height / rect.height);
    t.nowX = x;
    t.nowY = y;
    draw_cursor();
    cursor_canvas.style.cursor = "default";
    cursor_canvas.removeEventListener("click", myFunc);
    ;
}
/*坐标功能区结束*/

/*元件功能区开始*/
function valve() {
    // 阀门
    cache.push({nowX:t.nowX,nowY:t.nowY,heading:t.heading});
    cache_index+=1;
    ctx.save();
    ctx.translate(t.nowX, t.nowY);
    ctx.rotate(dToR(t.heading));
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.moveTo(3, -4);
    ctx.lineTo(3, 4);
    ctx.lineTo(16.86, -4);
    ctx.lineTo(16.86, 4);
    ctx.lineTo(3, -4);
    ctx.moveTo(19.84, -4);
    ctx.lineTo(19.84, 4);
    ctx.moveTo(6, -10);
    ctx.lineTo(14, -10);
    ctx.moveTo(10, -10);
    ctx.lineTo(10, -3);
    ctx.stroke();
    ctx.restore();
    setPos(19.84);
    draw_cursor();
}
function gang() {
    // 画杠
    let x1 = t.nowX + 6 * Math.cos(dToR(t.heading - 90));
    let y1 = t.nowY + 6 * Math.sin(dToR(t.heading - 90));
    let x2 = t.nowX + 6 * Math.cos(dToR(t.heading + 90));
    let y2 = t.nowY + 6 * Math.sin(dToR(t.heading + 90));
    ctx.beginPath()
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function quan(radius = 4) {
    ctx.beginPath();
    ctx.arc(t.nowX, t.nowY, radius, 0, Math.PI * 2);
    ctx.stroke();
}
function flange() {
    // 法兰
    gang();
    t.nowX += 4 * Math.cos(dToR(t.heading));
    t.nowY += 4 * Math.sin(dToR(t.heading));
    gang();
    draw_cursor();
}
function large_to_small() {
    // 异径管大到小
    startTrans()
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.lineTo(8, 2);
    ctx.lineTo(8, -2);
    endTrans()
    setPos(8);
    draw_cursor();
}
function small_to_large() {
    // 异径管小到大
    startTrans()
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.lineTo(8, 6);
    ctx.lineTo(8, -6);
    endTrans()
    setPos(8);
    draw_cursor()
}
function meter(flag) {
    // 仪表
    ctx.save();
    draw(5);
    if (flag === 0) { valve(); }
    draw(5);
    setPos(8);
    quan(8);
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    if (flag === 0) { ctx.fillText("A", t.nowX - 3, t.nowY + 3) }
    else { ctx.fillText("P", t.nowX - 3, t.nowY + 3) }
    ctx.restore();
}
function fluent() {
    startTrans();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.lineTo(0, -3);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    endTrans();
    draw_cursor();
}
function shape_snake() {
    startTrans();
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 5, 5, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.stroke();
    ctx.restore();
}
/*元件功能区结束*/

/*文件功能区*/
function undo() {
    // 撤销
    ctx.undo();
    t=cache[cache_index-1];
    cache_index-=1;
    draw_cursor();
}
function redo() {
    // 重做
    ctx.redo();
}
function clear_canvas() {
    if (confirm("你画的都没了！！确定吗？")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        initialize();
        draw_cursor();
    }
}
// 保存图片
function canvasToImage(backgroundColor) {
    //store the current globalCompositeOperation
    let compositeOperation = ctx.globalCompositeOperation;
    let data;
    if (backgroundColor) {
        //get the current ImageData for the canvas.
        data = ctx.getImageData(0, 0, w, h);
        //set to draw behind current content
        ctx.globalCompositeOperation = "destination-over";
        //set background color
        ctx.fillStyle = backgroundColor;
        //draw background / rect on entire canvas
        ctx.fillRect(0, 0, w, h);
    }
    //get the image data from the canvas
    let imageData = this.canvas.toDataURL("image/png");
    if (backgroundColor) {
        //clear the canvas
        ctx.clearRect(0, 0, w, h);
        //restore it with original / cached ImageData
        ctx.putImageData(data, 0, 0);
        //reset the globalCompositeOperation to what it was
        ctx.globalCompositeOperation = compositeOperation;
    }
    //return the Base64 encoded data url string
    return imageData;
}
function download() {
    let imageUrl = document.getElementById("download_image");
    imageUrl.href = canvasToImage("white");
    imageUrl.click();
}
function openFile() {
    document.getElementById("image_get").click();
}
function insert_image(files) {
    let file = files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        let img = new Image();
        // noinspection JSValidateTypes
        img.src = reader.result;
        img.onload = function () {
            ctx.drawImage(img, 0, 0)
        }
    }
}

/*文件功能区结束*/

/*快捷键绑定区*/
document.addEventListener("keypress", function (e) {
    let obj = e.target || e.srcElement;
    if (obj.tagName.toLowerCase() == "input") { return; }
    switch (e.key) {
        case "1": flange(); ; break;
        case "2": valve(); ; break;
        case "3": fluent(); ; break;
        case "4": shape_snake(); ; break;
        case "5": large_to_small(); ; break;
        case "6": small_to_large(); ; break;
        case "7": meter(0); ; break;
        case "8": meter(1); ; break;
        case "9": gang(); ; break;
        case "0": quan(); ; break;
        case "q":
        case "Q":
            set_nw(); ; break;
        case "w":
        case "W":
            set_up(); ; break;
        case "e":
        case "E":
            set_ne(); ; break;
        case "a":
        case "A":
            set_sw(); ; break;
        case "s":
        case "S":
            set_dn(); ; break;
        case "d":
        case "D":
            set_se(); ; break;
        case "r":
        case "R":
            setDegree(); ; break;
        case "f":
        case "F":
            draw(); ; break;
        case "z":
        case "Z":
            add_word(); ; break;
        case "x":
        case "X":
            setPosByCursor(); ; break;
    }
})
window.addEventListener("keydown", function (e) {
    if (e.altKey === true) {
        e.preventDefault();
        switch (e.key) {
            case "a":
            case "A":
                add_stamp(); break;
            case "s":
            case "S":
            case "1":
                goto_stamp(1); break;
            case "d":
            case "D":
                clear_stamp(); break;
            case "2": goto_stamp(2); break;
            case "3": goto_stamp(3); break;
            case "4": goto_stamp(4); break;
            case "5": goto_stamp(5); break;
        }
    }
    if (e.ctrlKey === true) {
        e.preventDefault();
        switch (e.key) {
            case "z":
            case "Z":
                undo(); break;
            case "y":
            case "Y":
                redo(); break;
            case "F1": draw_coordinates(); break;
        }
    }
})
/*快捷键绑定区结束*/

ctx.rect(1, 1, 746, 1056);
ctx.rect(628, 0, 120, 120);
ctx.stroke();
draw_coordinates();
draw_cursor();
UndoCanvas.enableUndo(ctx);
