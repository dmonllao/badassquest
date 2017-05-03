define(['bs'], function($) {

    return {

        init: function() {

            var canvas = document.createElement("canvas");
            canvas.width = 24;
            canvas.height = 24;

            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffcc99";
            ctx.font = "24px FontAwesome";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\uf111", 12, 12);

            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#333333";
            ctx.font = "24px FontAwesome";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("\uf255", 12, 12);

            var dataURL = canvas.toDataURL('image/png');

            $('#game-action').css('cursor', 'url('+dataURL+'), auto');
        },

        getActionButtonStyle: function(index) {
            var styles = ['btn-success', 'btn-danger', 'btn-warning', 'btn-primary', 'btn-info'];
            if (typeof styles[index] !== "undefined") {
                return styles[index];
            }
            // Mod otherwise.
            return styles[index % styles.length];
        },

        renderActionButtons: function(buttons, extraClasses = false) {

            var classes = 'action-buttons';
            if (extraClasses) {
                classes = classes + ' ' + extraClasses;
            }
            var html = '<div class="' + classes + '">';
            for (var i in buttons) {
                html = html + '<button id="' + buttons[i].id + '" class="btn ' +
                    this.getActionButtonStyle(i) + '">' + buttons[i].text + '</button>';
            }
            html = html + '</div>';
            return html;
        },

        renderOkButton: function(text, buttonClass) {

            if (!text) {
                text = '<i class="fa fa-check"></i>';
            }

            if (!buttonClass) {
                buttonClass = 'btn btn-success';
            }

            return '<div class="action-buttons continue-buttons">' +
                '<button id="ok" class="' + buttonClass + '">' + text + '</button>' +
                '</div>';
        },

        showModal: function(content, okButton, buttonClass) {

            if (okButton) {
                content = content + this.renderOkButton(okButton, buttonClass);
            }

            // We overwrite possible previous contents.
            $('#text-action-content').html(content);

            $('#text-action').modal('show');

            if (okButton) {
                $('#ok').on('click', function(ev) {
                    $('#text-action').modal('hide');
                });
            }
        },

        getPunch: function() {
            return '<span class="fa-stack"><i class="fa fa-circle fa-stack-1x" style="color: #ffcc99;"></i>' +
                '<i class="fa fa-hand-rock-o fa-stack-1x" style="#333333"></i></span>'
        },

        getIntroFooter: function() {
			return '<div class="links">' +
				'<a class="left" href="https://github.com/dmonllao/badassquest" target="_blank"><i class="fa fa-2x fa-github-alt"></i></a>' +
				'<a class="right" href="https://soundcloud.com/friggo-cz/sophomore-makeout" target="_blank"><img src="img/soundcloud.png"/></a>' +
				'</div>';
        }
    }
});
