var clock;
var timer;
var datetime;
var timer_audio = new Audio('./sound/clock-alarm.wav')
var alarm_audio = new Audio('./sound/alarm-rooster.wav')
var months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var seq = window.localStorage.getItem("seq")
var timer_item = window.localStorage.getItem("timer")
var alarm_item = window.localStorage.getItem("alarm")
if (seq === null) {
    window.localStorage.setItem("seq", 1)
    seq = window.localStorage.getItem("seq")
}
if (timer_item === null) {
    window.localStorage.setItem("timer", JSON.stringify({}))
    timer_item = window.localStorage.getItem("timer")
}
if (alarm_item === null) {
    window.localStorage.setItem("alarm", JSON.stringify({}))
    alarm_item = window.localStorage.getItem("alarm")
}
seq = parseInt(seq)
timer_item = $.parseJSON(timer_item)
alarm_item = $.parseJSON(alarm_item)
window.current_datetime = function() {
    clock = setInterval(function() {
        datetime = new Date();
        var hour = datetime.getHours()
        var min = datetime.getMinutes()
        var sec = datetime.getSeconds()
        var month = datetime.getMonth()
        var day = datetime.getDate()
        var year = datetime.getFullYear()
        hr = String(hour).padStart(2, '0');
        min = String(min).padStart(2, '0');
        sec = String(sec).padStart(2, '0');
        day = String(day).padStart(2, '0');
        Object.keys(alarm_item).map(function(k) {
            var _ai = alarm_item[k]
            if (String(hour + ":" + min + ":" + sec) == String(_ai.time + ":00")) {
                $('.alarm-text[data-id="' + _ai.id + '"]').addClass("blinks")
                alarm_audio.loop = true;
                alarm_audio.currentTime = 0;
                alarm_audio.play()
                $('#stop_alarm').removeClass('d-none')
            }
        })
        var hr = Math.abs(hour) > 12 ? Math.abs(hour) - 12 : hour;
        var meridiem = hour >= 12 ? "PM" : "AM";
        hr = String(hr).padStart(2, '0');
        var cur_time = hr + ":" + min + ":" + sec + " " + meridiem
        var cur_date = months[month] + " " + day + ", " + year
        $("#current_time").text(cur_time)
        $("#current_date").text(cur_date)
    }, 300)
}
window.uniModal = function($title = "", $content = {}, $data = []) {
    var uni = $('#uniModal')
    uni.find('.modal-title').html($title)
    uni.find(".modal-body").html("")
    uni.find(".modal-body").append($content)
    uni.modal("show")

    // Alarm Form Submit
    $content.find('form#alarm-form').submit(function(e) {
        e.preventDefault()
        e.stopImmediatePropagation();
        if ($(this)[0].checkValidity() === false) {
            $(this)[0].reportValidity()
            return false;
        }
        var _hr = $(this).find('[name="hour"]').val();
        var _min = $(this).find('[name="minutes"]').val();
        var _mer = $(this).find('[name="meridein"]').val();
        _hr = String(_hr).padStart(2, '0')
        _min = String(_min).padStart(2, '0')
        var alarm = _hr + ":" + _min + " " + _mer;
        if (_mer == "PM" && _hr != 12)
            _hr = Math.abs(_hr) + 12
        if (_mer == "AM" && _hr == 12)
            _hr = 0;
        _hr = String(_hr).padStart(2, '0')
        _min = String(_min).padStart(2, '0')
        __time = _hr + ":" + _min
        if ($(this).find('[name="id"]').val() > 0) {
            var _id = $(this).find('[name="hour"]').val();
        } else {
            seq++;
            localStorage.setItem('seq', seq)
            var _id = seq;
        }
        alarm_item[_id] = { id: _id, time: __time, alarm: alarm }
        localStorage.setItem('alarm', JSON.stringify(alarm_item))
        alert("Alarm Successfully Saved")
        new_alarm_list(_id)
        $('.modal').modal("hide")
    })

    // Timer Form Submit
    $content.find('form#timer-form').submit(function(e) {
        e.preventDefault()
        e.stopImmediatePropagation();
        if ($(this)[0].checkValidity() === false) {
            $(this)[0].reportValidity()
            return false;
        }
        timer_item = { timer: String($(this).find('[name="minutes"]').val()).padStart(2, '0') + ":" + String($(this).find('[name="seconds"]').val()).padStart(2, '0'), start: false }
        localStorage.setItem('timer', JSON.stringify(timer_item))
        alert("Timer Successfully set")
        $('.modal').modal('hide')
        reset_timer()
    })
}

// Timer Functions
window.start_timer = function() {
    $('#start_timer,#reset_timer').addClass("d-none")
    $('#pause_timer').removeClass("d-none")
    timer = setInterval(() => {
        var _time = $('#timer').text().split(':')
        var min = _time[0];
        var sec = _time[1];
        if (Math.abs(sec) == 0) {
            min = Math.abs(min) - 1
            sec = 59
        } else {
            sec = Math.abs(sec) - 1
        }
        min = String(min).padStart(2, '0')
        sec = String(sec).padStart(2, '0')
        $('#timer').text(min + ":" + sec)
        if (String(min + ":" + sec) == "00:00") {
            clearInterval(timer)
            timer_audio.loop = true
            timer_audio.currentTime = 0
            timer_audio.play()
            $('#start_timer,#pause_timer').addClass("d-none")
            $('#reset_timer').removeClass("d-none")
            $('#timer').addClass('blinks')
        }
    }, 1000)

}
window.pause_timer = function() {
    clearInterval(timer)
    timer_audio.pause()
    $('#reset_timer,#pause_timer').addClass("d-none")
    $('#start_timer').removeClass("d-none")
}
window.reset_timer = function() {
    timer_audio.pause()
    if (!!timer_item.timer) {
        if (timer_item.timer == "00:00") {
            $('#timer').text("--:--");
            $('#start_timer').attr('disabled', true)
        } else
            $('#timer').text(timer_item.timer);

    }
    $('#reset_timer,#pause_timer').addClass("d-none")
    $('#start_timer').removeClass("d-none")
    $('#timer').removeClass('blinks')

}
window.new_alarm_list = function(k) {
    var _alarm = alarm_item[k]
    var li = $($("noscript#alarm-item-script").html())
    li.attr('data-id', _alarm.id)
    li.find('.alarm-text').attr('data-id', _alarm.id)
    li.find('.alarm-text').text(_alarm.alarm)
    li.find('.delete-alarm').attr('data-id', _alarm.id)
    $('#alarm-list').append(li)
    li.find('.delete-alarm').click(function() {
        var _conf = confirm("Are you sure to delete " + _alarm.alarm + " alarm?")
        if (_conf === true) {
            delete alarm_item[_alarm.id]
            localStorage.setItem('alarm', JSON.stringify(alarm_item))
            alert("Alarm has been deleted successfully.")
            remove_alarm_list(_alarm.id)
        }
    })
}
window.remove_alarm_list = function(id) {
    $('#alarm-list .alarm-item[data-id="' + id + '"]').remove()
}

// Timer Functions: End
$(function() {
    current_datetime();
    $("#start_app").click(function() {
            $("#page-container").removeClass('d-none')
            $("#default-container").addClass('d-none')
        })
        // Timer Triggers
    $('#set_timer').click(function() {
        uniModal("Set New Timer", $($("noscript#timer-form-script").html()))
    })
    reset_timer()

    $('#start_timer').click(function() {
        start_timer();
    })
    $('#pause_timer').click(function() {
        pause_timer();
    })
    $('#reset_timer').click(function() {
        reset_timer();
    })

    // Timer triggers End


    // Setting Timer
    $('#uniModal').on('shown.bs.modal', function() {
        if (!!timer_item.timer && $(this).find('form#timer-form').length > 0) {
            var _time = timer_item.timer.split(":")
            $(this).find('[name="minutes"]').val(Math.abs(_time[0]))
            $(this).find('[name="seconds"]').val(Math.abs(_time[1]))
        }
    })

    // Setting Timer End

    // Alarm triggers

    Object.keys(alarm_item).map(k => {
        new_alarm_list(k)
    })

    $('#set_alarm').click(function() {
        uniModal("Set New Alarm", $($("noscript#alarm-form-script").html()))
    })
    $('#stop_alarm').click(function() {
        alarm_audio.pause()
        $(this).addClass('d-none')
        $('#alarm-list .blinks').removeClass('blinks')
    })


    // Alarm triggers: End

})