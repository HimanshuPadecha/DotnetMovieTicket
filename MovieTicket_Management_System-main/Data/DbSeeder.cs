using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(TmsContext db)
    {
        var needsReseed = false;
        try
        {
            await db.Database.EnsureCreatedAsync();
            _ = await db.Movies.Select(m => m.ImageUrl).FirstOrDefaultAsync();
            if (!await db.Movies.AnyAsync()) needsReseed = true;
        }
        catch
        {
            needsReseed = true;
            await db.Database.EnsureDeletedAsync();
            await db.Database.EnsureCreatedAsync();
        }

        if (!needsReseed && await db.Movies.AnyAsync()) return;

        var adminRole = new Role { Name = "ADMIN" };
        var customerRole = new Role { Name = "CUSTOMER" };
        db.Roles.AddRange(adminRole, customerRole);
        await db.SaveChangesAsync();

        db.Users.AddRange(
            new User { Name = "Admin", Email = "admin@cinema.com", Password = "Admin@123", RoleId = adminRole.Id },
            new User { Name = "Rahul Sharma", Email = "rahul@test.com", Password = "User@123", RoleId = customerRole.Id },
            new User { Name = "Priya Patel", Email = "priya@test.com", Password = "User@123", RoleId = customerRole.Id },
            new User { Name = "Amit Kumar", Email = "amit@test.com", Password = "User@123", RoleId = customerRole.Id }
        );

        var movies = new[]
        {
            new Movie
            {
                Title = "Inception",
                Genre = "Sci-Fi",
                Language = "English",
                DurationMinutes = 148,
                Rating = "U/A",
                Description = "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                ReleaseDate = new DateTime(2010, 7, 16),
                ImageUrl = "https://image.tmdb.org/t/p/w500/oYu7HuFlgZXG1W0eQBRR3xjL81J.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg"
            },
            new Movie
            {
                Title = "Jawan",
                Genre = "Action",
                Language = "Hindi",
                DurationMinutes = 169,
                Rating = "U/A",
                Description = "A high-octane action thriller that outlines the emotional journey of a man who is set to rectify the wrongs in society.",
                ReleaseDate = new DateTime(2023, 9, 7),
                ImageUrl = "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xtaQHw4LoZNYg.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg"
            },
            new Movie
            {
                Title = "Interstellar",
                Genre = "Sci-Fi",
                Language = "English",
                DurationMinutes = 169,
                Rating = "U/A",
                Description = "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                ReleaseDate = new DateTime(2014, 11, 7),
                ImageUrl = "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/xJHokMblPvKtuw086Ye2kiC2sX.jpg"
            },
            new Movie
            {
                Title = "3 Idiots",
                Genre = "Comedy",
                Language = "Hindi",
                DurationMinutes = 170,
                Rating = "U",
                Description = "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.",
                ReleaseDate = new DateTime(2009, 12, 25),
                ImageUrl = "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw67Q0kQe.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/u7kuUaySqXLiCZk2n0X3hYcMZQ.jpg"
            },
            new Movie
            {
                Title = "Dune: Part Two",
                Genre = "Sci-Fi",
                Language = "English",
                DurationMinutes = 166,
                Rating = "U/A",
                Description = "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                ReleaseDate = new DateTime(2024, 3, 1),
                ImageUrl = "https://image.tmdb.org/t/p/w500/1pdfLvkvpfWVAUTbl9rN0aE4K0e.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"
            },
            new Movie
            {
                Title = "Pathaan",
                Genre = "Action",
                Language = "Hindi",
                DurationMinutes = 146,
                Rating = "U/A",
                Description = "An Indian spy takes on the leader of a group of mercenaries who have nefarious plans to target his homeland.",
                ReleaseDate = new DateTime(2023, 1, 25),
                ImageUrl = "https://image.tmdb.org/t/p/w500/vZbe3PC2pH6hI9xDnNazPyo3WmO.jpg",
                BackdropUrl = "https://image.tmdb.org/t/p/w1280/8rpDcsfLJypbO6vRHmauHwJUsRM.jpg"
            }
        };
        db.Movies.AddRange(movies);
        await db.SaveChangesAsync();

        var pvr = new Theatre { Name = "PVR Phoenix", City = "Mumbai", Address = "Lower Parel, Mumbai" };
        var inox = new Theatre { Name = "INOX Megaplex", City = "Delhi", Address = "Saket, New Delhi" };
        var cinepolis = new Theatre { Name = "Cinepolis", City = "Bangalore", Address = "Forum Mall, Koramangala" };
        db.Theatres.AddRange(pvr, inox, cinepolis);
        await db.SaveChangesAsync();

        var screen1 = new Screen { Name = "Screen 1", TheatreId = pvr.Id, TotalSeats = 40 };
        var screen2 = new Screen { Name = "Screen 2", TheatreId = pvr.Id, TotalSeats = 40 };
        var screen3 = new Screen { Name = "Audi 1", TheatreId = inox.Id, TotalSeats = 40 };
        var screen4 = new Screen { Name = "Screen A", TheatreId = cinepolis.Id, TotalSeats = 40 };
        db.Screens.AddRange(screen1, screen2, screen3, screen4);
        await db.SaveChangesAsync();

        foreach (var screen in new[] { screen1, screen2, screen3, screen4 })
        {
            var seats = new List<Seat>();
            foreach (var row in new[] { "A", "B", "C", "D", "E", "F", "G", "H" })
            {
                for (var n = 1; n <= 5; n++)
                {
                    seats.Add(new Seat
                    {
                        ScreenId = screen.Id,
                        SeatNumber = $"{row}{n}",
                        SeatType = row is "A" or "B" or "C" ? "PREMIUM" : "REGULAR"
                    });
                }
            }
            db.Seats.AddRange(seats);
        }
        await db.SaveChangesAsync();

        var today = DateTime.Today;
        var shows = new[]
        {
            new Show { MovieId = movies[0].Id, ScreenId = screen1.Id, StartTime = today.AddHours(14), TicketPrice = 250 },
            new Show { MovieId = movies[0].Id, ScreenId = screen1.Id, StartTime = today.AddHours(18), TicketPrice = 300 },
            new Show { MovieId = movies[0].Id, ScreenId = screen4.Id, StartTime = today.AddHours(16), TicketPrice = 280 },
            new Show { MovieId = movies[1].Id, ScreenId = screen2.Id, StartTime = today.AddHours(15), TicketPrice = 220 },
            new Show { MovieId = movies[1].Id, ScreenId = screen2.Id, StartTime = today.AddHours(20), TicketPrice = 280 },
            new Show { MovieId = movies[2].Id, ScreenId = screen3.Id, StartTime = today.AddHours(13), TicketPrice = 260 },
            new Show { MovieId = movies[2].Id, ScreenId = screen3.Id, StartTime = today.AddDays(1).AddHours(19), TicketPrice = 320 },
            new Show { MovieId = movies[3].Id, ScreenId = screen1.Id, StartTime = today.AddDays(1).AddHours(11), TicketPrice = 180 },
            new Show { MovieId = movies[3].Id, ScreenId = screen3.Id, StartTime = today.AddDays(1).AddHours(16), TicketPrice = 200 },
            new Show { MovieId = movies[4].Id, ScreenId = screen4.Id, StartTime = today.AddHours(19), TicketPrice = 350 },
            new Show { MovieId = movies[4].Id, ScreenId = screen1.Id, StartTime = today.AddDays(1).AddHours(20), TicketPrice = 380 },
            new Show { MovieId = movies[5].Id, ScreenId = screen2.Id, StartTime = today.AddDays(1).AddHours(14), TicketPrice = 240 }
        };
        db.Shows.AddRange(shows);
        await db.SaveChangesAsync();

        var rahul = await db.Users.FirstAsync(u => u.Email == "rahul@test.com");
        var priya = await db.Users.FirstAsync(u => u.Email == "priya@test.com");
        var show1 = shows[0];
        var showJawan = shows[3];

        var booking1 = new Booking
        {
            BookingCode = "BK1001",
            UserId = rahul.Id,
            ShowId = show1.Id,
            TotalAmount = Math.Round(show1.TicketPrice * 1.25m * 2, 2),
            Status = "CONFIRMED",
            BookedAt = DateTime.UtcNow.AddHours(-2)
        };
        var booking2 = new Booking
        {
            BookingCode = "BK1002",
            UserId = priya.Id,
            ShowId = showJawan.Id,
            TotalAmount = showJawan.TicketPrice * 3,
            Status = "CONFIRMED",
            BookedAt = DateTime.UtcNow.AddHours(-1)
        };
        db.Bookings.AddRange(booking1, booking2);
        await db.SaveChangesAsync();

        var screen1Seats = await db.Seats.Where(s => s.ScreenId == screen1.Id).ToDictionaryAsync(s => s.SeatNumber);
        var screen2Seats = await db.Seats.Where(s => s.ScreenId == screen2.Id).ToDictionaryAsync(s => s.SeatNumber);

        db.BookingSeats.AddRange(
            new BookingSeat { BookingId = booking1.Id, SeatId = screen1Seats["A1"].Id },
            new BookingSeat { BookingId = booking1.Id, SeatId = screen1Seats["A2"].Id },
            new BookingSeat { BookingId = booking2.Id, SeatId = screen2Seats["D1"].Id },
            new BookingSeat { BookingId = booking2.Id, SeatId = screen2Seats["D2"].Id },
            new BookingSeat { BookingId = booking2.Id, SeatId = screen2Seats["D3"].Id }
        );
        await db.SaveChangesAsync();
    }
}
