import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig } from '../utils/firebaseConfig.js';

import { throttle } from '../utils/helper.js';
import { newstudySchema } from '../utils/schema.js';

const $form = document.querySelector('form');
const $tagInput = document.querySelector('.tag-id');
const $tagList = document.querySelector('.tag-list');
const $submitBtn = document.querySelector('.submit');
const $newstudyForm = document.querySelector('.newstudy-form');
const schema = newstudySchema;

let tags = [];
const colors = ['#ff99c8', '#fec8c3', '#fcf6bd', '#d0f4de', '#a9def9', '#c7d0f9', '#e4c1f9'];

const app = initializeApp(firebaseConfig);
const auth = getAuth();

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const getErrorMsgByInputName = inputName => schema[inputName].error;
const getIsValidByInputName = inputName => schema[inputName].isValid;
const getIsValid = () => schema.isValid;
const setSchemaValueByInputName = (inputName, value) => {
  schema[inputName].value = value;
};

const render = () => {
  $tagList.innerHTML = tags
    .map(
      ({ id, content }) => `
    <li class="item" style="background-color:${getRandomColor()}" data-id="${id}">${content}
          <i class='bx bxs-tag-x' ></i>
          </li>`
    )
    .join('');
};

const setErrorMessage = inputName => {
  $newstudyForm
    .querySelector(`input[name = ${inputName}], textarea[name=${inputName}]`)
    .closest('.input-container').lastElementChild.textContent = getIsValidByInputName(inputName)
    ? ''
    : getErrorMsgByInputName(inputName);
};

const activateSubmitButton = () => {
  $submitBtn.disabled = !getIsValid();
};

const validate = throttle(e => {
  const { name, value } = e.target;
  if (name === 'date-checker') {
    const formData = new FormData($newstudyForm);
    setSchemaValueByInputName(name, formData.has('date-checker'));
  } else if (name !== 'hash-id') {
    setSchemaValueByInputName(name, value.trim());
  }
  setErrorMessage(name);
  activateSubmitButton();
}, 300);

const setTags = newTags => {
  tags = newTags;
  setSchemaValueByInputName($tagInput.name, tags.length);
  setErrorMessage($tagInput.name);
  activateSubmitButton();
  render();
};

const generateTagId = () => Math.max(...tags.map(tag => tag.id), 0) + 1;

const addTags = content => {
  setTags([{ id: generateTagId(), content }, ...tags]);
};

const removeTag = id => {
  setTags(tags.filter(tag => tag.id !== +id));
};

$newstudyForm.oninput = validate;

$tagInput.onkeyup = e => {
  if (e.key !== 'Enter') return;
  const content = e.target.value.trim();

  if (content) addTags(content);
  $tagInput.value = '';
};

$tagList.onclick = e => {
  if (!e.target.classList.contains('bxs-tag-x')) return;
  removeTag(e.target.closest('li').dataset.id);
};

$form.onkeydown = e => {
  if (e.key !== 'Enter' || e.target.name === 'text-content') return;
  e.preventDefault();
};
