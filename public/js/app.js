if (document.addEventListener) {
    document.addEventListener('paste', onPasteTriggered, false)
}

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

function onPasteTriggered(e) {
    if (typeof e.clipboardData != 'undefined') {
        var copiedData = e.clipboardData.items[0]
        // Get the clipboard data
        // If the clipboard data is of type image, read the data/
        if (copiedData.type.indexOf("image") == 0) {
            var imageFile = copiedData.getAsFile()
            //We will use HTML5 FileReader API to read the image file
            var reader = new FileReader()
            reader.onload = function (evt) {
                var result = evt.target.result
                //base64 encoded image
                //Create an image element and append it to the content editable div
                var img = document.createElement("img")
                img.setAttribute('class', "img-responsive")
                img.src = result
                var tmp = document.createElement("div");
                tmp.appendChild(img);
                pasteHtmlAtCaret(tmp.innerHTML)

            };
            // Read the image file/
            reader.readAsDataURL(imageFile)
        }
    }
}

function load() {
    $.ajax({
        type: 'GET',
        url: '/cards',
        dataType: 'json'
    }).done(function (cards) {

        var container = $('#storyline')
        var emptyCard = $('#card-template')

        $(cards).each(function (index, card) {
            var newCard = $(emptyCard).clone()

            $(newCard).attr('id', '')
            $(newCard).find('.panel-title').append(card.title)
            $(newCard).find('.panel-body').append(card.content)
            $(container).append(newCard)
        })

        $('.card-delete').click(function () {
            $(this).parents('.card').first().remove()
        })

        //resize()
    })
}
load();

function create() {
    var container = $('#storyline')
    var emptyCard = $('#card-template')
    var newCard = $(emptyCard).clone()

    $(newCard).attr('id', '')
    $(newCard).find('.panel-title').append('title')
    $(newCard).find('.panel-body').append('')
    $(container).append(newCard)

    $(newCard).find('.card-delete').click(function () {
        $(this).parents('.card').first().remove()
    })

    //resize()
}

function save() {
    var cards = []
    $('.card:not(#card-template)').each(function (index, card) {

        var title = $(card).find('.panel-title').text()
        var content = $(card).find('.panel-body').html()

        var card = {
            title: title,
            content: content
        }
        cards.push(card)
    })

    $.ajax({
        type: 'POST',
        url: '/cards',
        data: {cards: JSON.stringify(cards)},
        dataType: 'json'
    }).done(function () {
    })

}

// Simple list
var list = document.getElementById('storyline')
Sortable.create(list, {
    animation: 500
})

$('#button-save').click(function (e) {
    e.preventDefault()
    save()
})

$('#button-new').click(function (e) {
    e.preventDefault()
    create()
})

function resize() {
    $('.panel-heading').matchHeight({
        byRow: true,
        property: 'height',
        target: null,
        remove: false
    })
    $('.panel-body').matchHeight({
        byRow: true,
        property: 'height',
        target: null,
        remove: false
    })
}
