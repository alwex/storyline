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
                img.className = "img-responsive"
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
    $('#overlay').removeClass('hidden')
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
            $(newCard).addClass(card.kind || 'story')
            $(newCard).find('.panel-title').append(card.title)
            $(newCard).find('.panel-body').append(card.content)
            $(container).append(newCard)
        })

        $('.card-delete').click(function () {
            $(this).parents('.card').first().remove()
        })

        $('#overlay').addClass('hidden')
        //resize()
    })
}
load();

function create(type) {
    var container = $('#storyline')
    var emptyCard = $('#card-template')
    var newCard = $(emptyCard).clone()

    $(newCard).attr('id', '')
    $(newCard).find('.panel-title').append('title')
    $(newCard).find('.panel-body').append('')
    $(newCard).addClass(type)
    $(container).append(newCard)

    $(newCard).find('.card-delete').click(function () {
        $(this).parents('.card').first().remove()
    })

    //resize()
}

function save() {
    var cards = []
    $('.card:not(#card-template)').each(function (index, card) {

        var kind = $(card).hasClass('story') ? 'story' : 'level'
        var title = $(card).find('.panel-title').text()
        var content = $(card).find('.panel-body').html()

        var card = {
            title: title,
            content: content,
            kind: kind
        }
        cards.push(card)
    })
    console.log(cards)
    if (cards.length > 0) {
        $('#overlay').removeClass('hidden')
        $.ajax({
            type: 'POST',
            url: '/cards',
            data: {cards: JSON.stringify(cards)},
            dataType: 'json'
        }).done(function () {
            console.log('passage')
            $('#overlay').addClass('hidden')
        }).fail(function () {
            alert('une erreur est survenue')
            console.log('failure')
        })
    }
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

$('#button-new-story').click(function (e) {
    e.preventDefault()
    create('story')
})

$('#button-new-level').click(function (e) {
    e.preventDefault()
    create('level')
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
