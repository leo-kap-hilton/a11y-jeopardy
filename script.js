import inertPolyfill from "https://cdn.skypack.dev/inert-polyfill@0.2.5";

let container = document.querySelector('#jeopardy-container');
let dialog = document.querySelector('[role="dialog"]');
let dialogContent = document.querySelector('#dialog-content');
let h1 = document.querySelector('h1');
  let closeDialogBtn = document.querySelector('#close-dialog');
let pageContent = document.querySelector('#page-content');
let activeButton = null;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

let build = (title, categories) => {
  container.innerHTML = '';
  
  let table = document.createElement('table');
  let caption = document.createElement('caption');
  caption.setAttribute('id', 'caption');
  caption.innerText = title;
  caption.setAttribute('tabindex', '-1');
  table.append(caption);
  let thead = document.createElement('thead');
  let tbody = document.createElement('tbody');
  let headerRow = document.createElement('tr');
  table.append(thead);
  table.append(tbody);
  thead.append(headerRow);
  
  categories.forEach(category => {
      let th = document.createElement('th');
      th.innerText = category.title;
      headerRow.append(th);
  });              
  
  
  for (var i=1; i<=5; i++) {
    let row = document.createElement('tr');
    tbody.append(row);
    
    categories.forEach((category, categoryIndex) => {
      let td = document.createElement('td');
      let button = document.createElement('button');
      button.innerText = i + '00';
      button.setAttribute('data-category', categoryIndex);
      button.setAttribute('data-level', i);
      
      if (!category['level'+i] || !category['level'+i].length) {
        button.setAttribute('disabled', true);
        let span = document.createElement('span');
        span.classList.add('at-only');
        span.innerText = 'empty';
        td.append(span);
      } else {
        button.setAttribute('data-modal-open', 'prompt-modal');
        let question = category['level'+i][getRandomInt(0, category['level'+i].length-1)];
        
        button.addEventListener('click', e => {
          dialog.querySelector('h1').innerText = question.answer;
          dialogContent.innerHTML = '';
          if (question.answer_details) {
            dialogContent.innerHTML += question.answer_details;
          }
          dialogContent.innerHTML += `<details><summary>Correct Response</summary>${question.question}</details>`;
          if (question.more) {
            dialogContent.innerHTML += `<details><summary>Further Reading</summary>${question.more}</details>`;
          }
          openDialog();
          activeButton = button;
          let span = document.createElement('span');
          span.classList.add('at-only');
          span.innerText = 'empty';
          td.append(span);
        });
      }
      
      td.append(button);
      row.append(td);
    });
    
  }
  
  attachArrowKeySupport(table, categories.length);
  
  container.append(table);
}

let attachArrowKeySupport = (table, numColumns) => {
  var focusGrid = [];
  var rows = table.querySelectorAll('tbody tr');
  var newFocusTarget;

  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].querySelectorAll('button');
    focusGrid.push([].slice.call(cells));
  }

  newFocusTarget = focusGrid[0][0];

  var findCurrentCoords = function() {
    // Find the current position
    for (var y = 0; y < focusGrid.length; y++) {
      for (var x = 0; x < focusGrid.length; x++) {
        if (focusGrid[y][x] === document.activeElement) {
          return {x: x, y: y};
        }
      }
    }
  };
  
  let seekInGrid = (axis, direction, currentCoords) => {
    let newPos = currentCoords[axis];
    while (true) {
      if (direction === 'positive') {
        newPos++;
      } else {
        newPos--;
      }

      if (newPos < 0) {
        // can't be negative
        return;
      }

      if (axis === 'y' && newPos > focusGrid.length-1) {
        // Can't be longer than the number of rows
        return;
      }

      if (axis === 'x' && newPos > numColumns-1) {
        // Can't be longer than the number of columns
        return;
      }

      // look at the next button on the x axis... if not disabled, return the button
      if (axis === 'x' && !focusGrid[currentCoords.y][newPos].hasAttribute('disabled')) {
        return focusGrid[currentCoords.y][newPos];
      }

      // look at the next button on the y axis... if not disabled, return the button
      if (axis === 'y' && !focusGrid[newPos][currentCoords.x].hasAttribute('disabled')) {
        return focusGrid[newPos][currentCoords.x];
      }
    }
  };

  let moveInGrid = function(key) {
    let currentCoords = findCurrentCoords();

    switch(key) {
      case 38: //up
        newFocusTarget = seekInGrid('y', 'negative', currentCoords);
        break;
      case 40: //down
        newFocusTarget = seekInGrid('y', 'positive', currentCoords);
        break;
      case 37: //left
        newFocusTarget = seekInGrid('x', 'negative', currentCoords);
        break;
      case 39: //right
         newFocusTarget = seekInGrid('x', 'positive', currentCoords);
        break;
      default:
        // nothing
    }
    
    if (newFocusTarget) {
      newFocusTarget.focus();
    }
  };

  table.addEventListener('keyup', function(e) {
    var key = e.which || e.keyCode;

    switch(key) {
      case 38: //up
      case 40: //down
      case 37: //left
      case 39: //right
        moveInGrid(key);
      default:
        // nothing
    }
  });
  
  
  table.addEventListener('keydown', function(e) {
    var key = e.which || e.keyCode;

    switch(key) {
      case 38: //up
      case 40: //down
      case 37: //left
      case 39: //right
        // prevent default browser keyup behavior for arrow keys
        e.preventDefault();
        return false;
      default:
        // nothing
    }
  });
}

let openDialog = () => {
  dialog.removeAttribute('hidden');
  dialog.removeAttribute('inert');
  let heading = dialog.querySelector('h1');
  console.log(heading);
  setTimeout(() => {
    // Looking at you, Safari/VO
    
  }, 0)
  heading.focus();
  pageContent.setAttribute('inert', true);
  pageContent.setAttribute('aria-hidden', "true");
}

let closeDialog = (button) => {
  if (dialog.getAttribute('hidden')) {
    // it's already closed
    return;
  }
  
  activeButton.setAttribute('disabled', true); // only disabled the button until after we are positive it no longer has focus, otherwise sr bugs to the moon!
  pageContent.removeAttribute('inert');
  pageContent.removeAttribute('aria-hidden');
  container.querySelector('caption').focus();
  dialog.setAttribute('hidden', true);
  dialog.setAttribute('inert', true);
}

closeDialogBtn.addEventListener('click', closeDialog);

document.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    closeDialog();
  }
});


fetch('https://raw.githubusercontent.com/tenon-io/wcag-as-json/master/wcag.json')
  .then(response => response.json())
  .then(wcag => {
    let categories = [];
    wcag.forEach((principle, principleIndex) => {
      categories[principleIndex] = {
        'title': principle.title,
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
      }
      
      if (principleIndex === 3) {
        categories[principleIndex].title = 'Robust';
      }
      
      principle.guidelines.forEach(guideline => {
        guideline.success_criteria.forEach(sc => {
          let q = {
            'question': 'What is ' + sc.ref_id + ' - ' + sc.title,
            'answer': 'This level ' + sc.level + ' SC states: ' + sc.description,
            'more': ''
          }
          
          if (sc.special_cases) {
            q.answer_details = `<ul>`;
            sc.special_cases.forEach(special_case => {
              q.answer_details += `<li><strong>${special_case.title}</strong>: ${special_case.description}</li>`;
            });
            q.answer_details += `</ul>`;
          }
          
          if (sc.references) {
            sc.more = `<ul>`;
            sc.references.forEach(reference => {
              q.more += `<li><a href="${reference.url}" target="_blank">${reference.title}</a>`
            })
            sc.more += `</ul>`;
          }
          
          if (sc.level === 'A') {
            if (!categories[principleIndex].level1.length) {
              categories[principleIndex].level1.push(q);
              return;
            }
            if (!categories[principleIndex].level2.length) {
              categories[principleIndex].level2.push(q);
              return;
            }
            categories[principleIndex]['level'+getRandomInt(1,2)].push(q);
            return;
          } else if (sc.level === 'AA') {
            if (!categories[principleIndex].level3.length) {
              categories[principleIndex].level3.push(q);
              return;
            }
            if (!categories[principleIndex].level4.length) {
              categories[principleIndex].level4.push(q);
              return;
            }
            categories[principleIndex]['level'+getRandomInt(3,4)].push(q);
            return;
          } else {
            if (!categories[principleIndex].level5.length) {
              categories[principleIndex].level5.push(q);
              return;
            }
            categories[principleIndex].level5.push(q);
            return;
          }
        });
      });
    });
  
    categories[3].level4.push({
      'question': 'What is 5.2.1 Conformance Level',
      'answer_details': `<ul><li>For Level A conformance (the minimum level of conformance), the Web page satisfies all the Level A Success Criteria, or a conforming alternate version is provided.</li>
<li>For Level AA conformance, the Web page satisfies all the Level A and Level AA Success Criteria, or a Level AA conforming alternate version is provided.</li>
<li>For Level AAA conformance, the Web page satisfies all the Level A, Level AA and Level AAA Success Criteria, or a Level AAA conforming alternate version is provided.</li>`,
      'answer': 'This conformance requirement states: One of the following levels of conformance is met in full.',
      'more': `<a href="https://www.w3.org/TR/WCAG21/#cc1" target="_blank">Learn more</a>`
    });
  
    categories[3].level4.push({
      'question': 'What is 5.2.2 Full pages',
      'answer': 'This conformance requirement states: Conformance (and conformance level) is for full Web page(s) only, and cannot be achieved if part of a Web page is excluded.',
      'more': `<a href="hhttps://www.w3.org/TR/WCAG21/#cc2" target="_blank">Learn more</a>`
    });
  
    categories[3].level4.push({
      'question': 'What is 5.2.3 Complete processes',
      'answer': 'This conformance requirement states: When a Web page is one of a series of Web pages presenting a process (i.e., a sequence of steps that need to be completed in order to accomplish an activity), all Web pages in the process conform at the specified level or better. (Conformance is not possible at a particular level if any page in the process does not conform at that level or better.)',
      'more': `<a href="https://www.w3.org/TR/WCAG21/#cc3" target="_blank">Learn more</a>`
    });
  
    categories[3].level5.push({
      'question': 'What is 5.2.4 Only Accessibility-Supported Ways of Using Technologies',
      'answer': 'This conformance requirement states: Only accessibility-supported ways of using technologies are relied upon to satisfy the success criteria. Any information or functionality that is provided in a way that is not accessibility supported is also available in a way that is accessibility supported. (See Understanding accessibility support.)',
      'more': `<a href="https://www.w3.org/TR/WCAG21/#cc4" target="_blank">Learn more</a>`
    });
  
    categories[3].level5.push({
      'question': 'What is 5.2.5 Non-Interference',
      'answer': 'This conformance requirement states: If technologies are used in a way that is not accessibility supported, or if they are used in a non-conforming way, then they do not block the ability of users to access the rest of the page. In addition, the Web page as a whole continues to meet the conformance requirements under each of the following conditions:',
      'answer_details': `<ol><li>when any technology that is not relied upon is turned on in a user agent,</li>
<li>when any technology that is not relied upon is turned off in a user agent, and</li>
<li>when any technology that is not relied upon is not supported by a user agent</li></ol><p>In addition, the following success criteria apply to all content on the page, including content that is not otherwise relied upon to meet conformance, because failure to meet them could interfere with any use of the page:</p><ul><li>1.4.2 - Audio Control,</li>
<li>2.1.2 - No Keyboard Trap,</li>
<li>2.3.1 - Three Flashes or Below Threshold, and</li>
<li>2.2.2 - Pause, Stop, Hide.</li></ul>`,
      'more': `<a href="https://www.w3.org/TR/WCAG21/#cc5" target="_blank">Learn more</a>`
    });
    
    categories[0] = {
        'title': 'Screen Readers',
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
    }
    
    categories[1] = {
        'title': 'Device Settings',
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
    }
    
    categories[2] = {
        'title': 'Assistive Technology',
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
    }
    
    categories[3] = {
        'title': 'Statistics',
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
    }
    
    categories[3].level1.push({
      'question': '<h2>33%</h2> <p>Source or other info</p>',
      'answer': 'What percentage of the population identifies as having a disability?',
      'answer_details': `<p>Additional info or screenshot</p>`
    });
    
    categories[3].level2.push({
      'question': '<h2>33%</h2> <p>Source or other info</p>',
      'answer': 'What percentage of the population identifies as having a disability?',
      'answer_details': `<p>Additional info or screenshot</p>`
    });
    
    categories[3].level3.push({
      'question': '<h2>33%</h2> <p>Source or other info</p>',
      'answer': 'What percentage of the population identifies as having a disability?',
      'answer_details': `<p>Additional info or screenshot</p>`
    });
    
    categories[3].level4.push({
      'question': '<h2>33%</h2> <p>Source or other info</p>',
      'answer': 'What percentage of the population identifies as having a disability?',
      'answer_details': `<p>Additional info or screenshot</p>`
    });
    
    categories[3].level5.push({
      'question': '<h2>33%</h2> <p>Source or other info</p>',
      'answer': 'What percentage of the population identifies as having a disability?',
      'answer_details': `<p>Additional info or screenshot</p>`
    });
  
    categories[4] = {
        'title': 'Glossary',
        'level1': [],
        'level2': [],
        'level3': [],
        'level4': [],
        'level5': []
    }
  
    categories[4].level1.push({
      'question': 'What is assistive technology',
      'answer': 'This term is defined as: hardware and/or software that acts as a user agent, or along with a mainstream user agent, to provide functionality to meet the requirements of users with disabilities that go beyond those offered by mainstream user agents'
    });
    
    categories[4].level1.push({
      'question': 'What is captions',
      'answer': 'This term is defined as: synchronized visual and/or text alternative for both speech and non-speech audio information needed to understand the media content'
    });
    
    categories[4].level1.push({
      'question': 'What is decorative',
      'answer': 'This term is defined as: serving only an aesthetic purpose, providing no information, and having no functionality'
    });
  
    categories[4].level1.push({
      'question': 'What is relative luminance',
      'answer': 'This term is defined as: the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white'
    });
    
    categories[4].level1.push({
      'question': 'What is role',
      'answer': 'This term is defined as: text or number by which software can identify the function of a component within Web content'
    });
  
    categories[4].level1.push({
      'question': 'What is sign language',
      'answer': 'This term is defined as: a language using combinations of movements of the hands and arms, facial expressions, or body positions to convey meaning'
    });
  
    categories[4].level1.push({
      'question': 'What is state',
      'answer': 'This term is defined as: dynamic property expressing characteristics of a user interface component that may change in response to user action or automated processes'
    });
    
    categories[4].level1.push({
      'question': 'What is text alternative',
      'answer': 'This term is defined as: Text that is programmatically associated with non-text content or referred to from text that is programmatically associated with non-text content. Programmatically associated text is text whose location can be programmatically determined from the non-text content.'
    });
  
    categories[4].level1.push({
      'question': 'What is user agent',
      'answer': 'This term is defined as: any software that retrieves and presents Web content for users'
    });
  
    categories[4].level1.push({
      'question': 'What is user interface component',
      'answer': 'This term is defined as: a part of the content that is perceived by users as a single control for a distinct function'
    });
    
    categories[4].level2.push({
      'question': 'What is programmatically determined (programmatically determinable)',
      'answer': 'This term is defined as: determined by software from author-supplied data provided in a way that different user agents, including assistive technologies, can extract and present this information to users in different modalities'
    });
  
    categories[4].level2.push({
      'question': 'What is programmatically determined link context',
      'answer': 'This term is defined as: additional information that can be programmatically determined from relationships with a link, combined with the link text, and presented to users in different modalities'
    });
  
    categories[4].level2.push({
      'question': 'What is programmatically set',
      'answer': 'This term is defined as: set by software using methods that are supported by user agents, including assistive technologies'
    });
    
    categories[4].level2.push({
      'question': 'What is status message',
      'answer': 'This term is defined as: change in content that is not a change of context, and that provides information to the user on the success or results of an action, on the waiting state of an application, on the progress of a process, or on the existence of errors'
    });
  
    categories[4].level3.push({
      'question': 'What is audio description',
      'answer': 'This term is defined as: narration added to the soundtrack to describe important visual details that cannot be understood from the main soundtrack alone'
    });
    
    categories[4].level3.push({
      'question': 'What is relationships',
      'answer': 'This term is defined as: meaningful associations between distinct pieces of content'
    });
  
    categories[4].level4.push({
      'question': 'What is extended audio description',
      'answer': 'This term is defined as: audio description that is added to an audiovisual presentation by pausing the video so that there is time to add additional description'
    });
  
      categories[4].level4.push({
      'question': 'What is label',
      'answer': 'This term is defined as: text that is presented to a user to identify a component'
    });
  
      categories[4].level4.push({
      'question': 'What is name',
      'answer': 'This term is defined as: text by which software can identify a component to the user'
    });
  
    categories[4].level4.push({
      'question': 'What is relied upon (technologies that are)',
      'answer': 'This term is defined as: the content would not conform if that technology is turned off or is not supported'
    });
  
    build('Mobile A11y Bowl', categories);
});

//build(categories);