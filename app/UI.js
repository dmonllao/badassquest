define(['bs'], function($) {


    return {

        getActionButtonStyle: function(index) {
            var styles = ['btn-success', 'btn-danger', 'btn-warning', 'btn-primary', 'btn-info'];
            if (typeof styles[index] !== "undefined") {
                return styles[index];
            }
            // Mod otherwise.
            return styles[index % styles.length];
        },

        renderActionButtons: function(buttons) {
            var html = '<div class="action-buttons">';
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

            return '<div class="action-buttons">' +
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
        }
    }
});
