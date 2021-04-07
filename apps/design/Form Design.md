# Form 규칙성

## 입력 단위 = FormItem 

- 좌상단: 제목
    - 필수 사항 여부 *
    - 입력 사항에 대한 자세한 설명 (Tooltip)
    - Focus 되었을때 Highlight 가 필요하다
- 중단: 입력 (Text, Number, Selection...)
    - 박스 형태로 감싸서 입력 가능한 영역임을 안내한다
    - 더 많은 안내가 필요한 경우 (설명)
        - 박스 내 하단에 옅은 2차 박스를 둬서 안내 사항을 기록한다
- 우하단: 에러 정보
    - 에러에 대한 텍스트
    - 에러에 대한 보다 자세한 설명 (Tooltip)
- 우상단: 부가 정보
    - 입력 항목에 대한 부가 정보가 있는 경우 배치 (e.g. 입력 가능 잔고액)

## 입력 사항들

### Input

- 박스 내에 Placeholder 로 위치 표식
- 단위가 있는 경우 우측 끝에 배치
- 기능 (Dropdown) 표식이 있는 경우 제일 우측에 표식한다.
    - [ ] 단위와 기능 표식이 동시에 존재하는 경우 어떻게 배치할지 방안이 필요하다
- Placeholder (안내) : 옅은 Text
- 실제 입력 내용 : 짙은 Text
- Text 입력이 가능하다는 의미를 주기 위해 (Dropdown 과 구분하기 위해) 앞에 | 를 표식한다 (채워지지 않은 경우 Blink 한다)

### Dropdown Anchor

- 우측에 Dropdown 기능 표식을 한다 (Input 이 기능 표식과 같다)
- Input 과 유사한 룰을 따른다
- 아무것도 선택되지 않았을 경우 : 옅은 Text
- 선택 가능하다는 의미를 주기 위해 (Text 와 구분하기 위해) 앞에 : 를 표식한다 (채워지지 않은 경우 Blink 한다)

### Readonly

- 입력 가능 또는 선택 가능의 의미 표식이 없다
- 짙은 Text 로 표현한다
- 박스 색상이 다른게 더 좋다


# Container Set

## Form

Options
- font-size: 모든 하위 Components 들은 em 으로 설계한다

Components
- Form Body
    - TextInput (String, Number...)
    - TextField (String)
    - Select (Many / One)
    - Radio Group (Many / One)
    - Checkbox Group (Many / Many)
    - Slider (Number)
    - Switch (Boolean)
        - 박스 내에서 On / Off Toggle 을 보여준다
        - 좌측에 Input 과 같이 Text 를 배치하고,
        - 우측 표식 위치에 Switch 를 넣는 것도 괜찮을듯 싶다
- Form Footer
    - FormButton
    - FormIconButton : FormButton 과 동일한 크기의 Circle Button

## Subset Actions (Fixture 또는 Body 내의 내용에 부가 기능을 붙일때 필요하다)

Options
- font-size: 모든 하위 Components 들은 em 으로 설계한다
- theme = main | sub : sub 의 경우 부가 기능으로서 색상 구조를 옅게 간다 

Components
- SubsetActions
- SubsetButton (MiniButton)
- SubsetIconButton : SubsetButton 과 동일한 크기의 Circle Button
- SubsetSelect

## List Actions (List 내에 기능을 붙일때 필요)

Options
- font-size: 모든 하위 Components 들은 em 으로 설계한다

Components
- ListButton : List 내의 Text 와 자연스럽게 어우러지게 한다
- ListSelect (우측에 기능 표식을 한다)
- ListSwitch

## SubTitle Actions (Body 내 SubTitle 우측에 붙는 의사 기능들)

Options
- font-size: 모든 하위 Componets 들은 em 으로 설계한다

Components
- SubTitleButton
- SubTitleIconButton
- SubTitleSelect (내용의 관점을 변경한다)
- SubTitleSwitch

## Header Actions (최상단 MenuBar 등의 부가 기능...)

- 이건 거의 Custom 으로 만들어야 할듯...


# Theme 병합 구조

- 모든 Container Actions 에는 Theme 를 붙일 수 있게 한다
- `<ThemeProvider>` 가 Subset 으로 발생할 경우 상위의 `theme` 와 병합해서 제공한다