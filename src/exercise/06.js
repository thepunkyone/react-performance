// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

const DogContext = React.createContext()
const GridContext = React.createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)

function dogReducer(state, action) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return action.dogName
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function gridReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return updateGridCellState(state, action)
    }
    case 'UPDATE_GRID': {
      return updateGridState(state)
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function DogProvider({children}) {
  const value = React.useReducer(dogReducer, '')

  return <DogContext.Provider value={value}>{children}</DogContext.Provider>
}

function GridProvider({children}) {
  const value = React.useReducer(gridReducer, initialGrid)

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>
}

function useDogContext() {
  const context = React.useContext(DogContext)
  if (!context) {
    throw new Error('useDogContext must be used within the DogProvider')
  }
  return context
}

function useGridContext() {
  const context = React.useContext(GridContext)
  if (!context) {
    throw new Error('useGridContext must be used within the GridProvider')
  }
  return context
}

function Grid() {
  const [, dispatch] = useGridContext()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)

  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function Cell({row, column}) {
  const [state, dispatch] = useGridContext()

  const cell = state[row][column]
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
Cell = React.memo(Cell)

function DogNameInput() {
  const [dogName, dispatch] = useDogContext()
  function handleChange(event) {
    const newDogName = event.target.value

    dispatch({type: 'TYPED_IN_DOG_INPUT', dogName: newDogName})
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}
function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>

      <div>
        <DogProvider>
          <DogNameInput />
        </DogProvider>
        <GridProvider>
          <Grid />
        </GridProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
