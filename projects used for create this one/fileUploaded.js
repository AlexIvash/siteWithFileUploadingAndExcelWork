//Here I will try to make a new site which will be used for uploading excel and then downloading back updated excel

const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const fs = require('fs');

const workOnFile = document.getElementById('workOnFile');
workWithExcel.addEventListener('click', function(e) {
    fetch('/workOnFile', {method: 'POST'})
});