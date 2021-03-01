const sectionsLenght = 30;
const sectionsData = Array.from({ length: sectionsLenght });
const getSectionId = (id) => `section-${id}`;

const DEV_MODE = false

const navListRender = () => {
  const innerElem = document.getElementsByClassName(
    "nav-box__header-inner"
  )[0];

  sectionsData.reduce((acc, current, index) => {
    const navBtn = document.createElement("div");
    navBtn.classList.add("nav-box__nav-btn", "flex-center");
    if (index === 0) {
      navBtn.classList.add("nav-box__nav-btn--active");
    }
    navBtn.setAttribute("id", `nav-btn-${index}`);
    navBtn.setAttribute("data-id", index);
    navBtn.addEventListener("click", (e) => {
      const section = document.querySelector(`#section-${index}`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
    const navBtnTextContent = document.createTextNode(index);
    navBtn.appendChild(navBtnTextContent);
    innerElem.appendChild(navBtn);
  }, "");
};

const bodyContentRender = () => {
  const navBoxbodyElem = document.getElementsByClassName(
    "nav-box__body"
  )[0];

  sectionsData.reduce((acc, current, index) => {
    const section = document.createElement("div");
    section.classList.add('section', 'flex-center');
    section.setAttribute("id", getSectionId(index));
    section.setAttribute("data-id", index);
    const sectionTextContent = document.createTextNode(
      `section ${index}`
    );
    section.appendChild(sectionTextContent);
    navBoxbodyElem.appendChild(section);
  }, "");
};

bodyContentRender();

const addObsever = () => {
  const sectionsElem = document.querySelectorAll(".section");
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  };

  const createState = (init = {}) => {
    let stateInner = { ...init };
    let hookQueueMap = {};

    const properties = Object.keys(stateInner).reduce((acc, currentKey) => {
      acc[currentKey] = {
        get: () => stateInner[currentKey],
        set: (newVal) => {
          if (DEV_MODE) {
            console.log(`set ${currentKey} to ${newVal}`);
          }

          const oldValue = stateInner[currentKey];
          stateInner[currentKey] = newVal;

          if (currentKey in hookQueueMap) {
            hookQueueMap[currentKey].forEach((cb) => {
              if (typeof cb === 'function') {
                cb(oldValue, newVal);
              }
            })
          }
        },
      }
      return acc
    }, {})

    let state = new Object();
    Object.defineProperties(state, properties);
    return {
      state,
      addStateHook: (key, cb) => {
        if (typeof cb === 'function') {
          if (key in hookQueueMap) {
            hookQueueMap[key].push(cb);
          } else {
            hookQueueMap[key] = [cb];
          }
        } else {
          throw new Error('cb is not a function');
        }
      }
    };
  };

  const switchCurActivedNavBtn = (oldValue, newValue) => {
    const navBtnActived = document.querySelector('.nav-box__nav-btn--active')
    // console.log(newValue, navBtnActived);
    if (navBtnActived) {
      const navBtns = document.querySelectorAll('.nav-box__nav-btn');
      navBtnActived.classList.remove('nav-box__nav-btn--active');
      navBtns[newValue].classList.add('nav-box__nav-btn--active');
    }
  }

  const initState = {
    firstVisibleElemIndex: 0,
    lastVisibleElemIndex: 0,
  }
  // const initState = {
  //   prevAppearedElemIndex: 0,
  //   prevDisappearedElemIndex: 0,
  //   curActivedElemIndex: 0,
  // }

  const { state, addStateHook } = createState(initState);

  addStateHook('firstVisibleElemIndex', (oldValue, newValue) => {
    console.log(`change firstVisibleElemIndex from ${oldValue} to ${newValue}`)
    switchCurActivedNavBtn(oldValue, newValue);
  })

  let observer = new IntersectionObserver((entries, observer) => {
    if (entries.length > 1) {
      const [first, ...rest] = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => parseInt(entry.target.getAttribute('data-id'), 10))
        .sort((a, b) => a > b);
      const last = rest[rest.length - 1];
      console.log(first, last);
      state.firstVisibleElemIndex = first;
      state.lastVisibleElemIndex = last;
      return null;
    }

    const entry = entries[0];

    const index = parseInt(entry.target.getAttribute("data-id"), 10);

    const prevNeighbor = Math.max(0, state.firstVisibleElemIndex - 1);
    if (index === prevNeighbor && entry.isIntersecting) {
      state.firstVisibleElemIndex = index;
    } else if (index === state.firstVisibleElemIndex && !entry.isIntersecting) {
      state.firstVisibleElemIndex = Math.min(
        sectionsData.length - 1,
        index + 1
      );
    }
  }, options);

  sectionsElem.forEach((section) => {
    observer.observe(section);
  });
};

const innerElem = document.getElementsByClassName(
  "nav-box__header-inner"
)[0];

innerElem.addEventListener("wheel", (e) => {
  innerElem.scrollLeft += e.deltaY / 10;
});

innerElem.addEventListener("scroll", (e) => { });
navListRender();
addObsever();