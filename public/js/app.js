if (document.addEventListener) {
  document.addEventListener('paste', onPasteTriggered, false)
}

function pasteHtmlAtCaret (html) {
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

function onPasteTriggered (e) {
  if (typeof e.clipboardData != 'undefined') {
    var copiedData = e.clipboardData.items[ 0 ]
    console.log(copiedData)
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
        console.log(tmp.innerHTML);
        pasteHtmlAtCaret(tmp.innerHTML)

      };
      // Read the image file/
      reader.readAsDataURL(imageFile)
    }
  }
}

function save () {
  var cards = []
  $('.card').each(function (index, card) {

    var title = $(card).find('.panel-title').text()
    var content = $(card).find('.panel-body').html()

    var card = {
      title: title,
      content: content
    }
    cards.push(card)
  })

  console.log(cards)

  $.ajax({
    type: 'POST',
    url: '/cards',
    data: { cards: JSON.stringify(cards) },
    dataType: 'json'
  }).done(function () {
    console.log('ok')
  })

}

$('.card-delete').click(function () {
  console.log('delete')
  $(this).parents('.card').first().remove()
})

// Simple list
var list = document.getElementById('storyline')
Sortable.create(list, {
  animation: 500
})