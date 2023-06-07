export default function get_select_monitor_position(monitors) {
  let { min_x, min_y } = get_min_max_x_y(monitors);
  let monitor = {};
  monitors.forEach((item) => {
    if (item.setting.is_select) {
      monitor = item;
    }
  });
  return {
    x: parseFloat(monitor.position.x - min_x),
    y: parseFloat(monitor.position.y - min_y),
  };
}

function get_min_max_x_y(monitors) {
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
  return {
    max_x: x_array.pop(),
    min_x: x_array[0],
    max_y: y_array.pop(),
    min_y: y_array[0],
  };
}
