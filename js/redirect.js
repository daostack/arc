/**
 * This is a simple mkdocs `extra_javascript` script that redirects
 * the user to `/README` automatically if location is `/`.
 *
 * Author: Matan Tsuberi <dev.matan.tsuberi@gmail.com>
 */

if(window.location.pathname === '/')
  window.location = 'README';
