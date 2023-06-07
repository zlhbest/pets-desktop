const zoom_size = 10;
const default_color = "#DADADA";
const havor_color = "#C2C2C2";
const select_color = "#0078D4";
const default_text_color = "black";
const havor_text_color = "white";
const select_havor_color = "#499DDD";
let monitors_array = []; // 转换后的monitors数组

// 画矩形 找
export default function create_monitors_canvas(
  canvas,
  monitors,
  callback_to_click_lisener
) {
  monitors_array = [];
  const context = canvas.getContext("2d");
  context.lineJoin = "round";
  context.lineWidth = 2;
  const canvas_width = canvas.width;
  const canvas_height = canvas.height;
  const conterX = canvas_width / 2;
  const conterY = canvas_height / 2;
  const offset = get_monitors_offset(monitors, conterX, conterY);
  for (var i = 0; i < monitors.length; i++) {
    // 设置字体
    context.font = "24px Helvetica ";
    context.textBaseline = "middle";

    let monitor = monitors[i];
    let width = monitor.size.width / zoom_size;
    let height = monitor.size.height / zoom_size;
    let positionx = monitor.position.x / zoom_size + offset.offset_x;
    let positiony = monitor.position.y / zoom_size + offset.offset_y;
    monitors_array.push({
      name: monitor.name,
      index: i,
      width: width,
      height: height,
      position: {
        x: positionx,
        y: positiony,
      },
      setting: monitor.setting,
    });
    context.beginPath();
    fillRoundRect(
      context,
      positionx,
      positiony,
      width,
      height,
      5,
      monitor.setting.is_select ? select_color : default_color
    );
    if (monitor.setting.is_select) {
      context.stroke();
    }

    context.beginPath();
    context.fillStyle = monitor.setting.is_select
      ? havor_text_color
      : default_text_color;
    context.fillText(i + 1, positionx + width / 2, positiony + height / 2);
    context.stroke();
  }
  // 获取鼠标监听
  canvas.addEventListener("mousemove", (e) => {
    // 清空画布
    context.clearRect(0, 0, canvas_width, canvas_height);
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    check_mouse_in_monitor(
      monitors_array,
      context,
      x,
      y,
      (monitor_item, index_t, isInPath) => {
        draw_hover_or_not_monitor(
          context,
          monitor_item,
          isInPath,
          index_t,
          monitor_item.setting.is_select
        );
      }
    );
  });

  // 鼠标点击事件
  canvas.addEventListener("click", (e) => {
    // 清空画布
    context.clearRect(0, 0, canvas_width, canvas_height);

    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    check_mouse_in_monitor(
      monitors_array,
      context,
      x,
      y,
      (monitor_item, index, isInPath) => {
        if (isInPath) {
          monitor_item.setting.is_select = !monitor_item.setting.is_select;
          // 这里进行只添加一个的判断
          if (monitor_item.setting.is_select) {
            monitors_array.forEach((item) => {
              if (item.name !== monitor_item.name) {
                item.setting.is_select = false;
              }
            });
          }
          // 每次有选择的时候就会回调，返回整个的检查情况
          callback_to_click_lisener(monitors_array);
        }
        draw_hover_or_not_monitor(
          context,
          monitor_item,
          isInPath,
          index,
          monitor_item.setting.is_select
        );
      }
    );
  });
}

function check_mouse_in_monitor(monitors_array, context, x, y, callback) {
  let index = 0;
  monitors_array.forEach((monitor_item) => {
    // 画一个矩形用来检测
    context.rect(
      monitor_item.position.x,
      monitor_item.position.y,
      monitor_item.width,
      monitor_item.height
    );
    callback(monitor_item, index, context.isPointInPath(x, y));
    index++;
  });
}

function draw_hover_or_not_monitor(context, monitor, isHover, index, isSelect) {
  let color = default_color;
  let text_color = default_text_color;
  if (isHover) {
    color = havor_color;
    text_color = havor_text_color;
  }
  if (isSelect) {
    color = select_color;
    text_color = havor_text_color;
  }
  if (isSelect && isHover) {
    color = select_havor_color;
    text_color = havor_text_color;
  }
  context.beginPath();
  fillRoundRect(
    context,
    monitor.position.x,
    monitor.position.y,
    monitor.width,
    monitor.height,
    5,
    color
  );
  if (isHover || isSelect) {
    context.stroke();
  }
  context.beginPath();
  context.fillStyle = text_color;
  context.fillText(
    index + 1,
    monitor.position.x + monitor.width / 2,
    monitor.position.y + monitor.height / 2
  );
}

function get_monitors_offset(monitors, conterX, conterY) {
  let x_array = monitors.map((x) => x.position.x);
  // 这里还需要加上 另一条边
  monitors.forEach((element) => {
    x_array.push(element.size.width + element.position.x);
  });
  x_array = x_array.sort();
  let y_array = monitors.map((x) => x.position.y);
  monitors.forEach((element) => {
    y_array.push(element.size.height + element.position.y);
  });
  y_array = y_array.sort();
  // 除以10的原因是分辨力太大了
  let max_x = x_array.pop() / zoom_size;
  let min_x = x_array[0] / zoom_size;
  let max_y = y_array.pop() / zoom_size;
  let min_y = y_array[0] / zoom_size;
  let conter_monitors_x = (max_x + min_x) / 2;
  let conter_monitors_y = (max_y + min_y) / 2;
  return {
    offset_x: conterX - conter_monitors_x,
    offset_y: conterY - conter_monitors_y,
  };
}
/**该方法用来绘制一个有填充色的圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param fillColor:填充颜色
 **/
function fillRoundRect(
  cxt,
  x,
  y,
  width,
  height,
  radius,
  /*optional*/ fillColor
) {
  //圆的直径必然要小于矩形的宽高
  if (2 * radius > width || 2 * radius > height) {
    return false;
  }

  cxt.save();
  cxt.translate(x, y);
  //绘制圆角矩形的各个边
  drawRoundRectPath(cxt, width, height, radius);
  cxt.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值
  cxt.fill();
  cxt.restore();
}

function drawRoundRectPath(cxt, width, height, radius) {
  cxt.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

  //矩形下边线
  cxt.lineTo(radius, height);

  //左下角圆弧，弧度从1/2PI到PI
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

  //矩形左边线
  cxt.lineTo(0, radius);

  //左上角圆弧，弧度从PI到3/2PI
  cxt.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);

  //上边线
  cxt.lineTo(width - radius, 0);

  //右上角圆弧
  cxt.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);

  //右边线
  cxt.lineTo(width, height - radius);
  cxt.closePath();
}
