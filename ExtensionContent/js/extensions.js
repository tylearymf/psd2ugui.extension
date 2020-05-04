//#region String扩展
if (!String.format) {
	String.format = function (format) {
		var str = format
		var args = Array.prototype.slice.call(arguments, 1);
		for (var index = 0; index < args.length; index++) {
			var element = args[index]
			str = str.replace("{" + index + "}", element)
		}
		return str
	}

	String.formatArguments = function (format, args) {
		var str = format
		var args = Array.prototype.slice.call(args, 1);
		for (var index = 0; index < args.length; index++) {
			var element = args[index]
			str = str.replace("{" + index + "}", element)
		}
		return str
	}
}
// #endregion String扩展

showDialog = true

// #region 弹提示
// 弹普通提示
ShowMsg = function (msg) {
	if (showDialog) {
		alert(String.formatArguments(msg, arguments))
	}
}

// 弹警告提示
ShowWarn = function (msg) {
	alert(String.formatArguments(msg, arguments))
}

// 弹错误提示
ShowError = function (msg) {
	alert(String.formatArguments(msg, arguments))
	throw new Error(msg, "customException", 0)
}

// 弹出堆栈信息
ShowErrorStack = function (error, msg) {
	var str = ""
	try {
		str = error.toString()
		str += "\nfileName:" + error.fileName
		str += "\nline:" + error.line
		str += "\nstack:" + $.stack
	} catch (error) {
		alert(error)
	}

	alert(String.formatArguments(msg, arguments) + " error:" + str)
}

assert = function (condition, msg) {
	if (!condition) {
		throw new Error(msg, "assertException", 0)
	}
}
// #endregion 弹提示