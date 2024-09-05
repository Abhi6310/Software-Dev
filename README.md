# CSCI 3308 Lab 2: Scripting, Git, and Regex

|                                                Course Website                                                 |                                                   Canvas                                                    |                                              Piazza                                               |
| :-----------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: |
| [![Course Website](https://img.shields.io/badge/Labs-Lab2-0A4D99)](https://csci3308.pages.dev/docs/labs/lab2) | [![Canvas](https://img.shields.io/badge/Canvas-CSCI3308-CFB87C)](https://canvas.colorado.edu/courses/110498) | [![Piazza](https://img.shields.io/badge/-Piazza-3e7aab)](https://piazza.com/class/m0agkuig4k6v4) |

## Overview

In this lab, you will learn how to use a linux terminal, practice some git commands, and write a shell script.

Please follow the instructions on the [course website](https://csci3308.pages.dev/docs/labs/lab2). Note that the above badges serve as quick links to the lab instructions, Course Canvas, and Course Piazza.

## Command Quick Reference

Run the `devel` image:

```bash
docker-compose run devel
```

Install vim:

```bash
apt-get update && apt-get install vim
```

Reclaim ownership of all files in the current working directory:

```bash
# uncomment if not in container
# docker-compose run devel
chown -R 1000:1000 .
```

Please refer to the lab instructions for more details.

## Submission Guidelines

To receive credit for this lab, you MUST check in with your TA during lab and upload your files and screenshots to this repo by the deadline.

Make sure to add, commit, and push your changes. You should run the following commands inside your local git directory. Make sure to double-check your submission through the browser.

In a terminal opened inside your repo:

```bash
mkdir submission # then, copy/move your files into the submission directory
git add submission
git commit -m "add all of the screenshots and files for lab2"
git push
```

### Code Changes

NO  | FIRSTNAME | LASTNAME | GITHUB_PROFILE
--  |           |          |    
1   | Abhinav   | Chalise  | Abhi6310
