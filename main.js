const chars = {}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function createGroup(ev) {
    ev.preventDefault();

    // Gather information
    var parent = ev.target.parentNode;
    var data = ev.dataTransfer.getData("text");
    var element = document.getElementById(data);
    var oldGroup = element.parentNode;
    console.log(data);
    
    // Generate new group with target
    var group = createGroupNode(parent)
    group.lastChild.before(element);

    // Clean up old group
    cleanup(oldGroup);
}

function cleanup(group) {
    if (group.childElementCount == 1) {
        group.parentNode.removeChild(group);
    }
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function createAddGroupNode(column) {
    var placeholder = document.createElement("div");
    placeholder.id = column.id + "-placeholder";
    placeholder.className = "placeholder group"
    placeholder.ondrop = createGroup;
    placeholder.ondragover = allowDrop;
    placeholder.onclick = () => createGroupWithCharacter(placeholder.parentNode)
    placeholder.innerText = "Add Group";
    
    column.appendChild(placeholder);
}

function createGroupWithCharacter(column) {
    group = createGroupNode(column)
    createCharacterForGroup(group)
}

function createCharacterForGroup(group) {
    var modal = document.getElementById("charname-modal")
    var modalForm = document.getElementById("modal-form")
    var nameInput = document.getElementById("modal-name-input")
    nameInput.value = ""
    var hpInput = document.getElementById("modal-hp-input")
    hpInput.value = ""
    var initInput = document.getElementById("modal-init-input")
    initInput.value = ""

    // Prep form submission
    modalForm.onsubmit = function(event) {
        var name = nameInput.value
        var hp = parseInt(hpInput.value) || 0
        var init = initInput.value

        name = name.trim()
        if (!(name in chars)) {
            if (name != "") {
                chars[name] = name
                addCharacterToGroup(group, name, hp, init)
            }
        }
        modal.style.display = "none"
        cleanup(group)

        return false;
    }

    // Prep closers
    document.getElementById("modal-close").onclick = function() {
        modal.style.display = "none"
        cleanup(group)
    }
    
    window.onclick = function(event) {
    if (event.target == modal) {
            modalForm.onsubmit = noop;
            modal.style.display = "none";
            cleanup(group)
        }
    }

    // Show modal
    modal.style.display = "block";
    nameInput.focus()
}

function noop(event) {
    return false;
}

function createGroupNode(column) {
    // Generate new group with target
    var group = document.createElement("div");
    group.id = column.id + "-" + (column.childElementCount - 1);
    group.className = "group";

    var placeholder = document.createElement("div");
    placeholder.className = "placeholder char";
    placeholder.innerText = "Add Character";
    placeholder.ondrop = addToGroup;
    placeholder.ondragover = allowDrop;
    placeholder.onclick = () => createCharacterForGroup(group)
    group.appendChild(placeholder);

    column.lastChild.previousSibling.before(group);

    
    return group;
}

function addToGroup(ev) {
    ev.preventDefault();

    // Gather information
    var data = ev.dataTransfer.getData("text");
    var element = document.getElementById(data);
    var oldGroup = element.parentNode;

    ev.target.before(element)

    cleanup(oldGroup);
}

function addCharacterToGroup(group, name, hp, init) {    
    var charNode = charToDiv(name, hp, init)
    group.lastChild.before(charNode)
}

// Initialize the columns
(function () {
    var columns = document.getElementsByClassName("column");
    for (i = 0; i < columns.length; i++) {
        c = columns[i];
        createAddGroupNode(c);
    }
})();

function charToDiv(name, hp, init) {
    var charNode = document.createElement("div")
    charNode.id = name;
    charNode.className = "char"
    charNode.draggable = true
    charNode.ondragstart = drag
    charNode.textContent = "(" + init + ") " + name
    charNode.dataset.hp = hp

    var hpNode = document.createElement("div")
    hpNode.id = name + "-hp"
    hpNode.className = "hp"

    var hpDisplay = document.createElement("span")
    hpDisplay.id = name + "-hp-display"
    hpDisplay.innerHTML = hp

    hpNode.appendChild(hpDisplay)

    var minusNode = document.createElement("input")
    minusNode.type = "button"
    minusNode.value = "-"
    minusNode.onclick = function(ev) {
        var charNode = ev.target.parentNode.parentNode
        var delta = -1
        if (ev.shiftKey) {
            delta = delta * 10
        }
        if (ev.ctrlKey) {
            delta = delta * 100
        }

        charNode.dataset.hp = (parseInt(charNode.dataset.hp) || 0) + delta
        document.getElementById(charNode.id + "-hp-display").innerText = charNode.dataset.hp
    }
    hpNode.appendChild(minusNode)

    var zeroNode = document.createElement("input")
    zeroNode.type = "button"
    zeroNode.value = "0"
    zeroNode.onclick = function(ev) {
        var charNode = ev.target.parentNode.parentNode
        charNode.dataset.hp = 0
        document.getElementById(charNode.id + "-hp-display").innerText = charNode.dataset.hp
    }
    hpNode.appendChild(zeroNode)

    var plusNode = document.createElement("input")
    plusNode.type = "button"
    plusNode.value = "+"
    plusNode.onclick = function(ev) {
        var charNode = ev.target.parentNode.parentNode
        var delta = 1
        if (ev.shiftKey) {
            delta = delta * 10
        }
        if (ev.ctrlKey) {
            delta = delta * 100
        }

        charNode.dataset.hp = (parseInt(charNode.dataset.hp) || 0) + delta
        document.getElementById(charNode.id + "-hp-display").innerText = charNode.dataset.hp
    }
    hpNode.appendChild(plusNode)

    charNode.appendChild(hpNode)
    return charNode
}