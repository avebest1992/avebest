/*
 *    Copyright(c)2021-2099, 江苏省特种设备安全监督检验研究院扬州分院
 *    项目名称:单线图手机端在线绘制
 *    文件名称:app.js
 *    Date:2021/3/22 下午10:50
 *    作者:周啸天
 */

// let screenW = document.documentElement.clientWidth;
// let screenH = document.documentElement.clientHeight;
// 初始化主画布
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 初始化指针画布
const cursor_canvas = document.getElementById("cursor_canvas");
const cursor = cursor_canvas.getContext("2d");
// 初始化标记画布
const stamp_canvas = document.getElementById("stamp_canvas");
const stamp = stamp_canvas.getContext("2d");
// 初始化操纵画布
const manipulate_canvas = document.getElementById("manipulate_canvas");
const manipulate = manipulate_canvas.getContext("2d");
manipulate.lineWidth = 2;
manipulate.setLineDash([4,2]);
// 初始化捕捉画布
const catch_canvas = document.getElementById("catch_canvas");
const autoCatch = catch_canvas.getContext("2d");
autoCatch.strokeStyle = 'grey';
autoCatch.lineWidth = 1;
autoCatch.setLineDash([3,1]);
let catchPoints = [];
let catchCount = 0;
function addCatch() {
    catchPoints[catchCount] = new Path2D();
    [catchPoints[catchCount].x,catchPoints[catchCount].y] = [t.nowX,t.nowY];
    catchPoints[catchCount].rect(t.nowX-4,t.nowY-4,8,8);
    catchCount += 1;
}
// 宽高初始化
function findFirstPositive(b, a, i, c) {
    c = (d, e) => e >= d ? (a = d + (e - d) / 2, 0 < b(a) && (a == d || 0 >= b(a - 1)) ? a : 0 >= b(a) ? c(a + 1, e) : c(d, a - 1)) : -1
    for (i = 1; 0 >= b(i);) i *= 2
    return c(i / 2, i) | 0
}
const dpi = findFirstPositive(x => matchMedia(`(max-resolution: ${x}dpi)`).matches)
// let w = 198 * dpi / 25.4;
// let h = 280 * dpi / 25.4;
let [w, h] = [748, 1058];
canvas.width = w;
canvas.height = h;
cursor_canvas.width = w;
cursor_canvas.height = h;
stamp_canvas.width = w;
stamp_canvas.height = h;
// 页面布局函数区
let page_display = [];
page_display[0] = document.getElementById("move_page");
page_display[1] = document.getElementById("component_page");
page_display[2] = document.getElementById("stamp_page");
page_display[3] = document.getElementById("coordinate_page");
page_display[4] = document.getElementById("function_page");
function toggle_page_display(index) {
    // 打开移动页
    for (let i = 0; i < 5; i++) {
        if (i === index) {
            page_display[i].style.display = "block";
        } else {
            page_display[i].style.display = "none";
        }
    }
}
function page_back() {
    // 关闭标签子页
    for (let i = 0; i < 5; i++) {
        page_display[i].style.display = "none";
    }
}
// 画布坐标轴
function initialize() {
    ctx.font = "10px Georgia";
    for (let i = 0; i < 100; i++) {
        ctx.fillText(String(50 * i), 50 * i, 10);
        ctx.fillText(String(50 * i), 0, 50 * i);
    }
}
// 初始化指针
let t = {
    nowX: 200,
    nowY: 200,
    heading: 0,
}
let cursorTransparency = 1
function draw_cursor(){
    if (cursorTransparency < 0.1) {
        cursorTransparency = 1;
    }else{
        cursorTransparency -= 0.01;
    }
    cursor.clearRect(0,0,w,h);
    cursor.save();
    cursor.beginPath();
    cursor.arc(t.nowX, t.nowY, 4, 0, Math.PI * 2);
    cursor.closePath();
    cursor.fillStyle = `rgba(0,0,255,${cursorTransparency})`;
    cursor.fill();
}
(function loopCursor(){
    draw_cursor();
    window.requestAnimationFrame(loopCursor);
})();
// draw_cursor();
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
    ctx.beginPath();
    ctx.moveTo(t.nowX, t.nowY);
    setPos(distance);
    ctx.lineTo(t.nowX, t.nowY);
    ctx.stroke();
    draw_cursor();
    addCatch();
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
// const label_now_direction = document.getElementById("label_now_direction");

function set_ne() {
    // 右上
    t.heading = -30;
    // label_now_direction.innerText=
    //     `当前方向为：${ne.innerText}`;
}
function set_se() {
    // 右下
    t.heading = 30;
    // label_now_direction.innerText=
    //     `当前方向为：${se.innerText}`;
}
function set_sw() {
    // 左下
    t.heading = 150;
    // label_now_direction.innerText=
    //     `当前方向为：${sw.innerText}`;
}
function set_nw() {
    // 左上
    t.heading = -150;
    // label_now_direction.innerText=
    //     `当前方向为：${nw.innerText}`;
}
function set_up() {
    t.heading = -90;
    // label_now_direction.innerText=
    //     "当前方向为：上";
}
function set_dn() {
    t.heading = 90;
    // label_now_direction.innerText=
    //     "当前方向为：下";
}
function change_button_text() {
    // 变更坐标系
    let temp = ne.innerHTML;
    ne.innerHTML = nw.innerHTML;
    nw.innerHTML = sw.innerHTML;
    sw.innerHTML = se.innerHTML;
    se.innerHTML = temp;
    ctx.clearRect(w - 120, 0, 120, 120);
    coordinate();
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
    ctx.lineWidth = 2;
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
// let stamp_id = 0;
// let stamp_index = 1;
function add_stamp() {
    stamps[stamp_count] = [t.nowX, t.nowY];
    stamp_count += 1;
    $('#chooseStamp').append(`<li><button class='liBtn' onclick='goto_stamp(${stamp_count})'>第${stamp_count}个标记</button></li>`);
    draw_stamp();
}
// function show_stamp_selected() {
//     stamp_index = document.getElementById("stamp_id").value;
//     document.getElementById("show_stamp_selected").innerText = `当前选择第${String(stamp_index)}个标记`;
// }
function goto_stamp(index = 1) {
    if (index > stamp_count) {
        alert("超出已有标记个数，请重试！");
        return
    }
    // stamp_id = index - 1;
    t.nowX = stamps[index - 1][0];
    t.nowY = stamps[index - 1][1];
    draw_cursor();
}
function clear_stamp() {
    stamps = [];
    stamp_count = 0;
    // stamp_id = 0;
    // stamp_index = 1;
    // document.getElementById("stamp_count").innerText = "当前个数:0";
    $('#chooseStamp > li').remove();
    stamp.clearRect(0, 0, 2000, 2000);
}
/*标记功能区结束*/

/*坐标功能区*/
// function show_cursor(){
//     // 显示坐标
//     let label_cursor = document.getElementById("label_cursor");
//     label_cursor.innerText = `当前坐标：(${String(t.nowX.toFixed())}，${String(t.nowY.toFixed())})`;
//     document.getElementById("dest_x").value = t.nowX.toFixed().toString();
//     document.getElementById("dest_y").value = t.nowY.toFixed().toString();
// }
// let dest_x,dest_y;
// function dest_cursor(){
//     // 预览坐标
//     dest_x = Number(document.getElementById("dest_x").value);
//     dest_y = Number(document.getElementById("dest_y").value);
//     cursor.clearRect(0,0,2000,2000);
//     cursor.beginPath();
//     let delta = 5000;
//     cursor.moveTo(dest_x-delta,dest_y);
//     cursor.lineTo(dest_x+delta,dest_y);
//     cursor.moveTo(dest_x,dest_y-delta);
//     cursor.lineTo(dest_x,dest_y+delta);
//     cursor.strokeStyle="blue";
//     cursor.stroke();
// }
function slightly_adjust(i) {
    switch (i) {
        case 1: t.nowY -= 0.5; break;
        case 2: t.nowX -= 0.5; break;
        case 3: t.nowX += 0.5; break;
        case 4: t.nowY += 0.5; break;
    };
    draw_cursor();
    add_cache();
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
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(word, t.nowX, t.nowY);
    }
}
function setPosByCursor() {
    cursor_canvas.style.cursor = "crossHair";
    catchPoints.forEach(ele => {
        autoCatch.stroke(ele);
    });
    cursor_canvas.addEventListener("click", myFunc);
}
function myFunc(event) {
    getMousePos(canvas, event);
}
function getMousePos(canvas, event) {
    autoCatch.clearRect(0,0,w,h);
    let isCatched = false
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left * (canvas.width / rect.width);
    let y = event.clientY - rect.top * (canvas.height / rect.height);
    for (let index = 0; index < catchPoints.length; index++) {
        const ele = catchPoints[index];
        if (autoCatch.isPointInPath(ele,x,y)){
            [t.nowX,t.nowY] = [ele.x,ele.y];
            isCatched = true;
            break
        }
    }
    // console.log("x:"+x+",y:"+y);
    // if(confirm("设定到当前位置？")){
    if (isCatched == false){
        t.nowX = x;
        t.nowY = y;
    }
    draw_cursor();
    cursor_canvas.style.cursor = "default";
    cursor_canvas.removeEventListener("click", myFunc);
    add_cache();
    // }
    // else {
    //     cursor_canvas.style.cursor = "default";
    //     cursor_canvas.removeEventListener("click",myFunc);
    // }
}
/*坐标功能区结束*/

/*元件功能区开始*/
function valve() {
    // 阀门
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
    draw(5);
    if (flag === 0) { valve(); }
    draw(5);
    setPos(8);
    quan(8);
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    if (flag === 0) { ctx.fillText("A", t.nowX - 3, t.nowY + 3) }
    else { ctx.fillText("P", t.nowX - 3, t.nowY + 3) }

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
let cache = [];
let cache_index = -1;
let imgCached = new Image();
function add_cache() {
    // 添加快照
    cache_index++;
    if (cache.length > 100) {
        // 限制一下缓存数量
        cache.shift();
        cache_index--;
    }
    // 重新开始绘制后截断后面的数据
    if (cache_index < cache.length) { cache.length = cache_index };
    cache.push({
        data: canvas.toDataURL(),
        x: t.nowX,
        y: t.nowY,
    });
}
function undo() {
    // 撤销
    if (cache_index >= 0) {
        cache_index--;
        ctx.clearRect(0, 0, w, h);
        // ctx.putImageData(cache[cache_index].data,0,0);
        imgCached.src = cache[cache_index].data;
        imgCached.onload = function () {
            ctx.drawImage(imgCached, 0, 0);
        }
        t.nowX = cache[cache_index].x;
        t.nowY = cache[cache_index].y;
        draw_cursor();
    } 
    else {
        alert("没了！");
    }
}
function redo() {
    // 重做
    if (cache_index < cache.length - 1) {
        cache_index++;
        ctx.clearRect(0, 0, w, h);
        // ctx.putImageData(cache[cache_index].data,0,0);
        imgCached.src = cache[cache_index].data;
        imgCached.onload = function () {
            ctx.drawImage(imgCached, 0, 0);
            URL.revokeObjectURL(imgCached.src);
        }
        t.nowX = cache[cache_index].x;
        t.nowY = cache[cache_index].y;
        draw_cursor();
    } else {
        alert("已经是最新的记录了");
    }
}
function clear_canvas() {
    if (confirm("你画的都没了！！确定吗？")) {
        ctx.clearRect(0, 0, w, h);
        ctx.rect(1, 1, w - 2, h - 2);
        ctx.stroke();
        coordinate();
        // draw_cursor();
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
function draw_coordinates() {
    let temp = t;
    t = {
        nowX: w - 60,
        nowY: 60,
        heading: 0,
    };
    ctx.save();
    let x = t.nowX;
    let y = t.nowY;
    ctx.fillStyle = "black";
    ctx.font = "16px 黑体";
    set_ne();
    draw(32);
    fluent();
    setPos(8);
    ctx.fillText(ne.innerHTML, t.nowX, t.nowY);
    t.nowX = x;
    t.nowY = y;
    set_up();
    draw(32);
    fluent();
    setPos(8);
    ctx.fillText("上", t.nowX - 8, t.nowY - 4);
    t.nowX = x;
    t.nowY = y;
    set_nw();
    draw(32);
    fluent();
    setPos(8);
    ctx.fillText(nw.innerHTML, t.nowX - 16, t.nowY);
    t.nowX = x;
    t.nowY = y;
    set_se();
    draw(40);
    ctx.fillText(se.innerHTML, t.nowX, t.nowY + 14);
    t.nowX = x;
    t.nowY = y;
    set_sw();
    draw(40);
    ctx.fillText(sw.innerHTML, t.nowX - 16, t.nowY + 14);
    t.nowX = x;
    t.nowY = y;
    set_dn();
    draw(40);
    ctx.fillText("下", t.nowX - 8, t.nowY + 16);
    t.nowX = x;
    t.nowY = y;
    t = temp;
    ctx.restore();
    // draw_cursor();
}
/*文件功能区结束*/

/*快捷键绑定区*/
document.addEventListener("keypress", function (e) {
    let obj = e.target || e.srcElement;
    if (obj.tagName.toLowerCase() == "input") { return; }
    switch (e.key) {
        case "1": flange(); add_cache(); break;
        case "2": valve(); add_cache(); break;
        case "3": fluent(); add_cache(); break;
        case "4": shape_snake(); add_cache(); break;
        case "5": large_to_small(); add_cache(); break;
        case "6": small_to_large(); add_cache(); break;
        case "7": meter(0); add_cache(); break;
        case "8": meter(1); add_cache(); break;
        case "9": gang(); add_cache(); break;
        case "0": quan(); add_cache(); break;
        case "q":
        case "Q":
            set_nw(); add_cache(); break;
        case "w":
        case "W":
            set_up(); add_cache(); break;
        case "e":
        case "E":
            set_ne(); add_cache(); break;
        case "a":
        case "A":
            set_sw(); add_cache(); break;
        case "s":
        case "S":
            set_dn(); add_cache(); break;
        case "d":
        case "D":
            set_se(); add_cache(); break;
        case "r":
        case "R":
            setDegree(); add_cache(); break;
        case "f":
        case "F":
            draw(); add_cache(); break;
        case "z":
        case "Z":
            add_word(); add_cache(); break;
        case "x":
        case "X":
            setPosByCursor(); add_cache(); break;
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
function change_coordinateStateBtn() {
    $('#basicPanel').toggle();
    let txt = $('#coordinateStateBtn');
    (txt.text() == '隐藏') ? txt.text('显示') : txt.text('隐藏');
}
// initialize();
add_cache();
function coordinate() {
    draw_coordinates();
    ctx.rect(w - 120, 0, 120, 120);
    ctx.stroke();
    draw_cursor();
}
ctx.lineWidth=2;
ctx.rect(1, 1, w - 2, h - 2);
ctx.stroke();
coordinate();

// 还没整理好的：
function test(){
    let word = 'P1111';
    ctx.save();
    ctx.translate(t.nowX,t.nowY);
    ctx.rotate(dToR(t.heading));
    ctx.font = '70px Arial'
    ctx.translate(0,-20);
    ctx.fillText(word,0,20);
    ctx.restore();
}

function windowToCanvas(x,y) {
    let rect = canvas.getBoundingClientRect();
    x = x - rect.left * (canvas.width / rect.width);
    y = y - rect.top * (canvas.height / rect.height);
    return [x,y];
}
let mRect = {x:0,y:0,w:0,h:0};
function handleMouseMove(e){
    let temp = windowToCanvas(e.clientX,e.clientY);
    [mRect.w,mRect.h] = [temp[0]-mRect.x,temp[1]-mRect.y];
    manipulate.clearRect(0,0,748,1058);
    manipulate.strokeRect(mRect.x,mRect.y,mRect.w,mRect.h);
    // manipulate.stroke();

}
function handleMouseDown(e){
    [mRect.x,mRect.y]=windowToCanvas(e.clientX,e.clientY)
    cursor_canvas.addEventListener('mousemove',handleMouseMove);
    cursor_canvas.addEventListener('mouseup',()=>{
        console.log('mouseup')
        cursor_canvas.removeEventListener('mousemove',handleMouseMove)
    },{once:true});
}
cursor_canvas.addEventListener('mousedown',handleMouseDown);
function paste(){
    cursor_canvas.removeEventListener('mousedown',handleMouseDown);
    // cursor_canvas.removeEventListener('mouseup',handleMouseUp);
    let imgData = ctx.getImageData(mRect.x,mRect.y,mRect.w,mRect.h);
    ctx.putImageData(imgData,t.nowX,t.nowY,);
    
}