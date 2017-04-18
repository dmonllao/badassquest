define(['bs'], function($) {


    return {

        getActionButtonStyle: function(index) {
            var styles = ['btn-danger', 'btn-success', 'btn-warning', 'btn-primary', 'btn-info'];
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

        renderOkButton: function(text) {
            var html = '<div class="action-buttons">' +
                '<button id="ok" class="btn btn-success">' + text + '</button>' +
                '</div>';
            return html;
        },

        showModal: function(content, okButton) {

            if (okButton) {
                content = content + this.renderOkButton(okButton);
            }

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
