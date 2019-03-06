let entriesWrapper = document.querySelector('section.entry')
let haveOriginal = (typeof window.sessionStorage.getItem('hkItem') === 'string')
function bind () {
  let hkItem = document.querySelectorAll('.homekitItem')
  hkItem.forEach(function (item) {
    if (!haveOriginal) {
      window.sessionStorage.setItem('hkItem', item.innerHTML)
      haveOriginal = true
      console.log('set hkitem')
    }
    let codeInput = item.querySelector('.codeInput')
    codeInput.addEventListener('keydown', validate)
  })
}
function validate (evt) {
  let fauxInput = evt.target
  let theEvent = evt || window.event
  let key = theEvent.keyCode || theEvent.which
  let prevEvt = theEvent.preventDefault
  let appendString = ''
  // Handle pasting codes
  if (theEvent.type === 'paste') {
    key = evt.clipboardData.getData('text/plain')
  } else {
    let atLimit = (parseInt(evt.target.attributes.max.value) <= evt.target.innerText.length)
    key = String.fromCharCode(key)
    // Handle backspaces
    if (theEvent.keyCode === 8) {
        prevEvt = false
        if (evt.target.innerText.length > 0) {
          appendPlaceholder(theEvent)
        }
    } else {
      // Enforce limit
      if (atLimit) {
        logEntry(evt.target)
        evt.preventDefault()
        return
      }
      // Allow only numbers
      let regex = /[0-9]|\./
      let isNotAllowed = !regex.test(key)
      if (prevEvt) {
        if(isNotAllowed) {
          evt.preventDefault()
          return
        }
        theEvent.returnValue = prevEvt
      }
      let rmChars = 1
      let appendExtra = ''
      switch (fauxInput.innerText.length) {
        case 2:
        case 5:
          appendExtra = '-'
          break
      }
      if (appendExtra.length) {
        let newText = key + appendExtra
        rmChars = 2
        evt.target.textContent = evt.target.innerText + newText
        evt.preventDefault()
      }
      evt.target.dataset.content = evt.target.dataset.content.substring(rmChars, evt.target.dataset.content.length)
      // Set cursor position to end of user input
      setCaret(evt.target, false)
    }
  }
}
function appendPlaceholder (evt) {
  let maxLn = parseInt(evt.target.attributes.max.value)
  let currentLn = evt.target.innerText.length
  let doneReplace = false
  let countToReplace = maxLn - (evt.target.dataset.content.length + evt.target.innerText.length - 1)
  while (countToReplace > 0) {
    switch (evt.target.innerText.length) {
      case 4:
      case 7:
        appendString = '-'
        break
      default:
        appendString = 'x'
        break
    }
    evt.target.dataset.content = appendString + evt.target.dataset.content
    countToReplace--
  }
}
function setCaret (target, isStart) {
  const range = document.createRange()
  const sel = window.getSelection()
  if (isStart) {
    const newText = document.createTextNode('')
    target.appendChild(newText)
    range.setStart(target.childNodes[0], 0)
  }
  else {
    range.selectNodeContents(target)
  }
  range.collapse(isStart)
  sel.removeAllRanges()
  sel.addRange(range)
  target.focus()
}
function logEntry (target) {
  let inputEl = target.parentNode.querySelector('.homekitCodeHidden')
  let entryRemove = target.parentElement.parentElement.querySelector('.removeItem')
  let printLink = document.getElementById('pagePrint')
  let newEntry = document.createElement('div')
  let newIndex = target.parentNode.querySelector('.codeInput').tabIndex
  if (inputEl) {
    inputEl.value = target.innerText
  }
  if (inputEl.checkValidity()) {
    // Show label and add another input
    let labelInput = document.createElement('span')
    target.parentElement.parentElement.setAttribute('data-modified', true)
    labelInput.setAttribute('class', 'itemLabel')
    labelInput.setAttribute('contenteditable', 'true')
    labelInput.setAttribute('data-content', 'Description')
    labelInput.setAttribute('onclick', 'delete this.dataset.content')
    labelInput.setAttribute('max', '125')
    labelInput.setAttribute('onkeypress', 'return (this.innerText.length <= 35)')
    target.parentElement.parentElement.appendChild(labelInput)
    printLink.style.display = 'inline'
    newEntry.setAttribute('class', 'homekitItem')
    newEntry.setAttribute('data-index', newIndex)
    newEntry.setAttribute('tabindex', newIndex)
    newEntry.setAttribute('data-modified', false)
    newEntry.innerHTML = window.sessionStorage.getItem('hkItem').replace('tabindex="0"', 'tabindex="'+ newIndex + '"')
    entriesWrapper.prepend(newEntry)
    entryRemove.addEventListener('click', removeRow)
    bind()
    let testEl = document.querySelector('.codeInput[tabindex="' + newIndex + '"]')
    testEl.focus()
  }
}
function removeRow (evt) {
  evt.target.parentElement.innerHTML = ''
}
window.onload = bind;
