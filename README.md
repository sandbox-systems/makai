# Makai
Code for Sandbox 4.0: Makai™

Desired font: Raleway
Desired image type: SVG

index is Landing
file manager is Castle
chat is Luau (No Longer Maintained)
IDE is Sandbox
home (4 tiles) is Home
Castle, Luau, Sandbox, Notifications extend from navbar.html

# Makai Guidelines (v3.1)
Jump to...
- [Line Breaks, Whitespace](#line-breaks-whitespace)
- [Conventions](#conventions)
- [Organization](#organization)
- [Version Control](#version-control)
- [Attribution](#attribution)

When writing any project code, please follow the following guidelines to maintain consistency.
## Line Breaks, Whitespace
Use 4 space indents:
```
def func():
	# code
```
Put space after # in comments:
```
# comment
```
Put spaces on either side of an operator, EXCEPT with unary operators:
```
a = b + c
d = e || f && g
```

Blocks should be logically seperated with line breaks as appropiate:
```
determineDirection()
moveToPoint()

prepareForAction()
```
## Conventions
Variables and parameters should be typed in under_score. Classes should be typed in PascalCase.
```
variable_name = 'hello'

class ClassName:
	# code

```
In a `for` loop, `i` should be the primary iterator, `j` the secondary iterator if necessary, `k` the third, and so on...
```
for i in range(0, 10):
	for j in range(0, 20):
		# code
```

### Logical Detours
Code should be as straightforward as possible. Often, inexperienced programmers write code that is unneccessarily complicated, making it more time-consuming to be both understood and executed. The following are examples of some "novice mistakes" to be aware of.
#### Toggling a boolean
```
if x == True:
  x = False
elif x == False:
  x = True

# is equivalent to...

x = not x # much cleaner, and takes one instruction instead of several.

```
#### Setting a variable
This one happens more than it should.
```
if x != 0:
  x = 0

# the above is actually more expensive than...
x = 0

```
## Organization
All functions should be defined at the top of the file, BEFORE the main block.
```
def a():

def b():

a()
b()
```
In classes, accessors and mutators should be defined at the end of the class, getter then setter, in the order that the members are declared. 
```
class Example:
	x = 0
  
	def __init__(self):
		self.x = 1
  
	def do_something(self):
		pass
  
	def get_x(self):
		return self.x
		
	def set_x(self, x):
		self.x = x
```
## Version Control
To effectively use Git it is important to stay organised and consistent in versioning.

### Commits
Document your commits well and push often to keep your code backed up and available to everyone, especially when you're committing at a milestone.

Commits should be in good English, succinct, and effective. Use a maximum of 72 characters in the summary and expand details on what was accomplished in the description as necessary.
Commits should be in present tense, explaining what the commit does rather than what you did:
"Add account & notif apps, add urls in each app, and configure routing"

### Branches

Branch out when beginning work on a major new feature. Otherwise, work off of another branch as necessary.

# Working Directory Organization

Features should be logically organized into sub-directories.

