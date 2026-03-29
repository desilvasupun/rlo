/**
 * Name: Supun De Silva
 * AthabascaID: 3508216
 * Title: README.txt
 * Date: 22 Mar. 2026
 * Description: Documentation for the Production-Oriented LAMPP Stack on Ubuntu Server reusable learning object
 * @author Supun De Silva
 * @version 1.0
 * @copyright 2026 Supun De Silva
 */
/**
 * DOCUMENTATION
 *
 * Purpose and Description
 * This project is a static reusable learning object delivered as a set of linked
 * web pages. It guides learners through planning, building, hardening, validating,
 * and documenting an Ubuntu Server virtual machine that runs Apache,
 * MariaDB, PHP, and Python. The RLO is organized into modules so that learners
 * can complete the build one layer at a time and verify progress at each stage.
 *
 * Usage Instructions
 * Open index.html in a web browser to use the learning object.
 *
 * Use the sidebar navigation or module buttons to move through the RLO in order.
 * The recommended sequence is:
 * Module 0 - Introduction and Planning
 * Module 1 - VM Creation and Ubuntu Server Installation
 * Module 2 - Baseline Configuration and Hardening
 * Module 3 - Install Apache and Configure a Virtual Host
 * Module 4 - Install and Secure MariaDB
 * Module 5 - Install PHP and Connect It to Apache
 * Module 6 - Deploy the Demo PHP Site
 * Module 7 - Install Python and Run an Automation Script
 * Module 8 - Final Validation and Evidence Package
 *
 * Checklist progress is stored locally in the learner's browser on the current
 * device. The site itself is fully static and can be opened offline, although
 * the learning tasks described inside the modules require external software,
 * an Ubuntu Server ISO, and internet access for package installation and
 * official documentation.
 *
 * Main Project Files
 * index.html
 * The overview page for the RLO. This page introduces the topic, audience,
 * learning outcomes, prerequisites, module map, and success criteria.
 *
 * references.html
 * The bibliography page for the RLO. This page contains the reference list used
 * to support the instructional content.
 *
 * styles.css
 * Shared stylesheet for the entire RLO. This file controls layout, navigation,
 * module cards, screenshot presentation, buttons, progress elements, and the
 * image enlargement view.
 *
 * script.js
 * Shared client-side script for the RLO. This file handles interactions such as
 * copy buttons, checklist progress, and the screenshot enlargement behavior.
 *
 * modules/
 * Folder containing the instructional module pages that make up the core learning
 * material of the RLO.
 *
 * assets/
 * Folder containing screenshots and graphics used by the modules, including the
 * architecture diagram and all module-specific evidence images.
 *
 * Module Pages
 * modules/00-introduction-planning.html
 * Introduces the stack, required tools, downloads, and evidence preparation.
 *
 * modules/01-vm-ubuntu-install.html
 * Guides the learner through creating the VM, installing Ubuntu Server, and
 * collecting the first validation evidence.
 *
 * modules/02-hardening.html
 * Covers package updates, OpenSSH verification, direct root SSH login hardening,
 * and enabling UFW for SSH access.
 *
 * modules/03-apache.html
 * Covers Apache installation, document-root creation, virtual-host setup, and
 * opening HTTP access through the firewall.
 *
 * modules/04-mariadb.html
 * Covers MariaDB installation, secure installation, database creation, and
 * creation of a least-privilege application account.
 *
 * modules/05-php.html
 * Covers PHP package installation, Apache integration, and browser-based PHP
 * verification.
 *
 * modules/06-demo-php-site.html
 * Covers deployment of the demo PHP application, protection of the private
 * database configuration, and verification of browser output.
 *
 * modules/07-python-automation.html
 * Covers Python tooling, virtual-environment creation, and a local health-check
 * script that validates the deployed site.
 *
 * modules/08-final-validation.html
 * Guides the learner through final end-to-end validation and preparation of the
 * evidence package captured across the earlier modules.
 *
 * Supporting Assets
 * assets/architecture.svg
 * Diagram showing the relationship between the browser, Apache, PHP, MariaDB,
 * and Python inside the Ubuntu Server VM.
 *
 * assets/module_0 to assets/module_8
 * Screenshot folders used to illustrate the steps in each module and support the
 * evidence-driven design of the RLO.
 */
