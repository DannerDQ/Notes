"use strict"

//$(select) & $$(selectAll) ==> functions in index.html script tag
const newNote = $("#newNoteButton");
const search = $("#searchInput");

function newID() {
  for (let i = 0; ; i++) {
    if (usedID.has(`N-${i}`)) continue
    else return "N-" + i;
  }
}

function NewNote() {
  const id = newID();
  openNotesMap.set(id, {
    text: "",
    color: ["default", "defaultBorder"],
    id: id,
    open: true,
    saved: false
  });
  usedID.add(id);
  render(id, openNotesMap.get(id));
}

function addEventListeners(element, tag) {
  if (tag === "form") {

    for (let span of $$("span", $(".colors", element))) {
      span.addEventListener("click", () => {
        span.parentElement.classList.replace("grid", "invisible");
        const [color, border] = [element.classList[1], element.classList[2]];
        element.classList.replace(color, span.className);
        element.classList.replace(border, span.className + "Border");
        $(".buttons", element).style.backgroundColor = `var(--${span.className})`;
        const update = savedNotesMap.get(element.id);
        update.color = [element.classList[1], element.classList[2]];
        savedNotesMap.set(element.id, update);
        $(`#${element.id}`, notesSaved).classList.replace(color, span.className);
        $(`#${element.id}`, notesSaved).classList.replace(border, span.className + "Border");
        notesSaved.insertBefore($(`#${element.id}`, notesSaved), notesSaved.firstElementChild);
      })
    }

    $(".color", element).addEventListener("click", () => {
      $(".colors", element).classList.replace("invisible", "grid");
    });

    $(".delete", element).addEventListener("click", () => {
      if (element.classList.contains("saved")) {
        $(`#${element.id}`, notesSaved).remove();
        savedNotesMap.delete(element.id);
      }
      openNotesMap.delete(element.id);
      usedID.delete(element.id);
      element.remove();
    });

    $(".close", element).addEventListener("click", () => {
      element.remove();
      openNotesMap.delete(element.id);
      const update = savedNotesMap.get(element.id);
      if (update) {
        update.open = false;
        savedNotesMap.set(element.id, update);
      }
    })

    $(".new", element).addEventListener("click", NewNote);

    $(".save", element).addEventListener("click", () => {
      savedNotesMap.set(element.id, {
        text: $("textarea", element).value,
        color: [element.classList[1], element.classList[2]],
        date: new Date().getTime(),
        id: element.id,
        open: true,
        saved: true
      });
      element.classList.add("saved");
      render(element.id, savedNotesMap.get(element.id));
    })

    $("textarea", element).addEventListener("input", () => {
      $("textarea", element).value = limChar($("textarea", element).value, true);
      $(".limChar", element).textContent = $("textarea", element).value.length + "/500";
    });

  }
  if (tag === "li") {

    // $(".new", element).addEventListener("click", NewNote);

    $(".edit", element).addEventListener("click", () => {
      const update = savedNotesMap.get(element.id);
      if (update) {
        update.open = true;
        savedNotesMap.set(element.id, update);
      }
      openNotesMap.set(element.id, savedNotesMap.get(element.id));
      render(element.id, savedNotesMap.get(element.id));
    });

    $(".delete", element).addEventListener("click", () => {
      if (savedNotesMap.get(element.id).open) {
        $(`#${element.id}`, openNotes).remove();
        openNotesMap.delete(element.id);
      }
      savedNotesMap.delete(element.id);
      usedID.delete(element.id);
      element.remove();
    });
  }
}

function limChar(text, textarea = false) {
  if (textarea) {
    if (text.length > 500) return text.slice(0, 500)
    else return text;
  } else return text;
}

function render(id, obj) {
  let { text, color, saved, open } = obj;
  text ??= "";
  if (saved) {
    if ($(`#${id}`, notesSaved) === null) {
      const li = document.importNode($("#templateNoteSaved").content.firstElementChild, true);
      li.setAttribute("id", id);
      li.classList.add(color[0], color[1]);
      $("p", li).textContent = limChar(text);
      $(".date", li).textContent = getDate(id);
      addEventListeners(li, "li");
      notesSaved.insertBefore(li, notesSaved.firstElementChild);
      search.value ? find() : false
    } else {
      $("p", $(`#${id}`, notesSaved)).textContent = limChar(savedNotesMap.get(id).text);
      notesSaved.insertBefore($(`#${id}`, notesSaved), notesSaved.firstElementChild);
      $(".date", $(`#${id}`, notesSaved)).textContent = getDate(id);
      search.value ? find() : false
    }
  }

  if (open) {
    if ($(`#${id}`, openNotes) !== null) {
      $("textarea", $(`#${id}`, openNotes)).focus();
      return null;
    }
    const form = document.importNode($("#templateNewNote").content.firstElementChild, true);
    form.setAttribute("id", id);
    form.classList.add(color[0], color[1]);
    $(".buttons", form).style.backgroundColor = `var(--${form.classList[1]})`;

    saved ? form.classList.add("saved") : false;

    $("textarea", form).value = openNotesMap.get(id) ? openNotesMap.get(id).text : "";
    addEventListeners(form, "form");
    $(".limChar", form).textContent = $("textarea", form).value.length + "/500";
    openNotes.insertBefore(form, openNotes.firstElementChild);
    $("textarea", form).focus();
  }
}

function getDate(id) {
  const oldDate = new Date();
  oldDate.setTime(savedNotesMap.get(id).date);
  const newDate = new Date();
  const [newday, newmonth, newyear] = [newDate.getDate(), newDate.getMonth(), newDate.getFullYear()];
  const [oldday, oldmonth, oldyear] = [oldDate.getDate(), oldDate.getMonth(), oldDate.getFullYear()];

  if (newyear > oldyear
    || (newmonth > oldmonth
      || newday > oldday)) {
    return oldDate.toLocaleDateString();
  } else {
    let [hour, minutes, meridian] = [oldDate.getHours(), oldDate.getMinutes(), " AM"];
    if (hour < 12) hour = "0" + hour
    else {
      hour = hour > 12 ? "0" + hour - 12 : hour;
      meridian = " PM";
    }
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hour + ":" + minutes + meridian;
  }
}

function find() {
  savedNotesMap.forEach(note => {
    const [text, value] = [note.text, search.value]
    const bold = document.createElement("b")
    bold.classList.add("find")
    const li = $(`#${note.id}`, notesSaved)
    const paragraph = $("p", li)
    paragraph.classList.add("scroll")
    paragraph.innerHTML = "";
    const split = text.split(new RegExp(value, "img"))
    let splitText = text.match(new RegExp(value, "img"))
    splitText ??= value
    split.forEach((line, index) => {
      const textNode = document.createTextNode(line)
      paragraph.appendChild(textNode)
      bold.textContent = typeof splitText === 'object' ? splitText[index] : splitText
      if (index < split.length - 1) paragraph.appendChild(document.importNode(bold, true))
    })
    notesSaved.insertBefore(li, notesSaved.firstElementChild)
  });
}

newNote.addEventListener("click", NewNote)

search.addEventListener("input", find);

window.addEventListener("load", () => {
  savedNotesMap.forEach((value, key) => {
    render(key, value);
  })
  openNotesMap.forEach((value, key) => {
    render(key, value)
  })

  if ($("#light").checked) colorScheme.href = "light.css";
  else colorScheme.href = "dark.css";
  
  if (search.value !== "" || search.value !== undefined || search.value !== null) find()
});

window.addEventListener("beforeunload", () => {
  openNotesMap.forEach(note => {
    const update = note;
    update.text = $("textarea", $(`#${note.id}`, openNotes)).value;
    openNotesMap.set(note.id, update);
  })

  localStorageNotes.saved = Object.fromEntries(savedNotesMap);
  localStorageNotes.open = Object.fromEntries(openNotesMap);
  const usedIDs = Array.from(usedID.keys());
  localStorage.setItem("notes", JSON.stringify(localStorageNotes));
  localStorage.setItem("notes id's", JSON.stringify(usedIDs));
});
