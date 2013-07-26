# Less TSS

An Alloy tss pre-processor inspired by less

Note that it isn't less so less features won't necessarily work

# Syntax

## Variables

```
@color: '#4D926F';

"#header": {
  color: @color
}
"Label": {
  color: @color
}
```

becomes

```
"#header": {
  color: '#4D926F'
}
"Label": {
  color: '#4D926F'
}
```

## Mixins

```
.padding (@pad: '5dp') {
  top: @pad,
  bottom: @pad,
  left: @pad,
  right: @pad
}

"#header" : {
  .padding()
}
"#footer" : {
  .padding('10px')
}
```

becomes

```
"#header" : {
  top: '5dp',
  bottom: '5dp',
  left: '5dp',
  right: '5dp'
}
"#footer" : {
  top: '10px',
  bottom: '10px',
  left: '10px',
  right: '10px'
}
```
## Includes

This

```
@include("./mixin");
@color: '#4D926F';

"#header": {
  color: @color
}
"Label": {
  color: @color
}
```

and the file **mixin.ltss** (in the mixin section above) becomes this:

```
"#header" : {
  top: '5dp',
  bottom: '5dp',
  left: '5dp',
  right: '5dp'
}
"#footer" : {
  top: '10px',
  bottom: '10px',
  left: '10px',
  right: '10px'
}


"#header": {
  color: '#4D926F'
}
"Label": {
  color: '#4D926F'
}
```

## CLI Usage

Install

```
[sudo] npm install -g ltss
```

then

```
ltss [filename.ltss]
```

converted file will be return to stdout

```
ltss [filename.ltss] filename.tss
```

converted file will be written to the output file provided


## Library Usage

the following commands are available: `compileString(string, callback)`, `compileFile(filename, callback)`,
`writeFile(source, target, callback)`

## Extended Example

```
@variable1: 1;
@test2  :  3

.mixin1 (@arg1, @arg2) {
  length: @arg1,
  bredth: @arg2
}

.mixin2(@color: 'red') {
  backgroundColor: @color
}


".class" : {
  height: @variable1,
  text: 'hello',
  width: @test2,
  .mixin2(),
  .mixin1(20, 30)
}

".class2" : {
  .mixin2("blue")
}
```

becomes

```
".class" : {
  height: 1,
  text: 'hello',
  width: 3,
  backgroundColor: 'red',
  length: 20,
  bredth:  30
}

".class2" : {
  backgroundColor: "blue"
}
```

## Grunt Plugin

See this [repo](https://github.com/dbankier/grunt-ltss).
