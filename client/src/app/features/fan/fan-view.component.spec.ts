import { render, screen } from '@testing-library/angular';
import { FanViewComponent } from '../fan/fan-view.component';
import { StadiumService } from '../../core/services/stadium.service';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

describe('FanViewComponent', () => {
  it('should render stadium selection', async () => {
    const mockStadiums = [
      { id: 'stadium-01', name: 'MetLife Stadium', city: 'New York', capacity: 82500 }
    ];
    
    const stadiumService = jasmine.createSpyObj('StadiumService', ['getStadiums']);
    stadiumService.getStadiums.and.returnValue(of(mockStadiums));

    await render(FanViewComponent, {
      providers: [{ provide: StadiumService, useValue: stadiumService }],
      imports: [HttpClientModule, ReactiveFormsModule]
    });

    expect(screen.getByText('⚽ Fan Companion')).toBeTruthy();
  });
});
